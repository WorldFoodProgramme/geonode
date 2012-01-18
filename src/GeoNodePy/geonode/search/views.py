import json

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from haystack.inputs import AutoQuery
from haystack.query import SearchQuerySet

from geonode.maps.views import default_map_config, Map, Layer, Contact


def search(request):
    DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config()
    #DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config(request)
    # for non-ajax requests, render a generic search page

    if request.method == "GET":
        params = request.GET
    elif request.method == "POST":
        params = request.POST
    else:
        return HttpResponse(status=405)

    map = Map(projection="EPSG:900913", zoom=1, center_x=0, center_y=0)

    counts = {
        "maps": Map.objects.count(),
        "layers": Layer.objects.count(),
        "vector": Layer.objects.filter(storeType="dataStore").count(),
        "raster": Layer.objects.filter(storeType="coverageStore").count(),
        "users": Contact.objects.count()
    }

    return render_to_response("search/search.html", RequestContext(request, {
        "init_search": json.dumps(params or {}),
        #'viewer_config': json.dumps(map.viewer_json(added_layers=DEFAULT_BASE_LAYERS, authenticated=request.user.is_authenticated())),
        "viewer_config": json.dumps(map.viewer_json(*DEFAULT_BASE_LAYERS)),
        "GOOGLE_API_KEY": settings.GOOGLE_API_KEY,
        "site": settings.SITEURL,
        "counts": counts,
        "keywords": Layer.objects.gn_catalog.get_all_keywords()
    }))


def search_api(request):
    query = request.REQUEST.get("q", "")
    start = int(request.REQUEST.get("start", 0))
    limit = int(request.REQUEST.get("limit", getattr(settings, "HAYSTACK_SEARCH_RESULTS_PER_PAGE", 20)))
    sort = request.REQUEST.get("sort", "relevance")

    sqs = SearchQuerySet()

    if query:
        sqs = sqs.filter(content=AutoQuery(query))

    if sort.lower() == "newest":
        sqs = sqs.order_by("-date")
    elif sort.lower() == "oldest":
        sqs = sqs.order_by("date")
    elif sort.lower() == "alphaaz":
        sqs = sqs.order_by("title")
    elif sort.lower() == "alphaza":
        sqs = sqs.order_by("-title")

    results = []

    for i, result in enumerate(sqs[start:start + limit]):
        data = json.loads(result.json)
        data.update({"iid": i + start})
        results.append(data)

    data = {
        "success": True,
        "total": sqs.count(),
        "rows": results,
    }

    return HttpResponse(json.dumps(data), mimetype="application/json")