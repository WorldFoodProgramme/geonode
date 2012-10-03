Ext.override(Ext.dd.DragTracker,{onMouseMove:function(a){if(this.active&&Ext.isIE&&!Ext.isIE9&&!a.browserEvent.button)a.preventDefault(),this.onMouseUp(a);else{a.preventDefault();var c=a.getXY(),b=this.startXY;this.lastXY=c;if(!this.active)if(Math.abs(b[0]-c[0])>this.tolerance||Math.abs(b[1]-c[1])>this.tolerance)this.triggerStart(a);else return;this.fireEvent("mousemove",this,a);this.onDrag(a);this.fireEvent("drag",this,a)}}});
var GeoExplorer=Ext.extend(gxp.Viewer,{localGeoServerBaseUrl:"",localCSWBaseUrl:"",useMapOverlay:null,fromLayer:!1,mapPanel:null,toolbar:null,capGrid:null,modified:0,popupCache:null,urlPortRegEx:/^(http[s]?:\/\/[^:]*)(:80|:443)?\//,backgroundContainerText:"UT:Background",connErrorTitleText:"UT:Connection Error",connErrorText:"UT:The server returned an error",connErrorDetailsText:"UT:Details...",heightLabel:"UT: Height",largeSizeLabel:"UT:Large",layerContainerText:"UT:Map Layers",layerSelectionLabel:"UT:View available data from:",
layersContainerText:"UT:Data",layersPanelText:"UT:Layers",mapSizeLabel:"UT: Map Size",metadataFormCancelText:"UT:Cancel",metadataFormSaveAsCopyText:"UT:Save as Copy",metadataFormSaveText:"UT:Save",metaDataHeader:"UT:About this Map",metaDataMapAbstract:"UT:Abstract",metaDataMapTitle:"UT:Title",miniSizeLabel:"UT: Mini",premiumSizeLabel:"UT: Premium",propertiesText:"UT:Properties",publishActionText:"UT:Publish Map",saveFailMessage:"UT: Sorry, your map could not be saved.",saveFailTitle:"UT: Error While Saving",
saveMapText:"UT: Save Map",saveMapAsText:"UT: Save Map As",saveNotAuthorizedMessage:"UT: You Must be logged in to save this map.",smallSizeLabel:"UT: Small",sourceLoadFailureMessage:"UT: Error contacting server.\n Please check the url and try again.",unknownMapMessage:"UT: The map that you are trying to load does not exist.  Creating a new map instead.",unknownMapTitle:"UT: Unknown Map",widthLabel:"UT: Width",zoomSelectorText:"UT:Zoom level",zoomSliderTipText:"UT: Zoom Level",zoomToLayerExtentText:"UT:Zoom to Layer Extent",
constructor:function(a){this.popupCache={};this.addEvents("saved","beforeunload");Ext.preg("gx_wmssource",gxp.plugins.WMSSource);Ext.preg("gx_olsource",gxp.plugins.OLSource);Ext.preg("gx_googlesource",gxp.plugins.GoogleSource);Ext.util.Observable.observeClass(Ext.data.Connection);Ext.data.Connection.on({beforerequest:function(a,b){var d=b.url.replace(this.urlPortRegEx,"$1/");if(this.localGeoServerBaseUrl){if(0==d.indexOf(this.localGeoServerBaseUrl)){b.url=d.replace(RegExp("^"+this.localGeoServerBaseUrl),
"/geoserver/");return}var e=this.localGeoServerBaseUrl.replace(this.urlPortRegEx,"$1/");if(0===d.indexOf(e+"rest/")){b.url=d.replace(RegExp("^"+e),"/geoserver/");return}}if(this.proxy&&0!==b.url.indexOf(this.proxy)&&0===b.url.indexOf(window.location.protocol))d=b.url.replace(/&$/,"").split("?"),e=Ext.apply(d[1]&&Ext.urlDecode(d[1])||{},b.params),d=Ext.urlAppend(d[0],Ext.urlEncode(e)),delete b.params,b.url=this.proxy+encodeURIComponent(d)},requestexception:function(a,b,d){if(!d.failure)if(this.mapPlugins[0].busyMask&&
this.mapPlugins[0].busyMask.hide(),a=d.url,401==b.status&&a.indexOf("http"!=0)&&-1===a.indexOf(this.proxy)){var b=function(){f.getForm().submit({waitMsg:"Logging in...",success:function(a,b){e.close();document.cookie=b.response.getResponseHeader("Set-Cookie");Ext.Ajax.request(d)},failure:function(a){var b=a.items.get(0),a=a.items.get(1);b.markInvalid();a.markInvalid();b.focus(!0)},scope:this})}.createDelegate(this),e=new Ext.Window({title:"GeoNode Login",modal:!0,width:230,autoHeight:!0,layout:"fit",
items:[{xtype:"form",autoHeight:!0,labelWidth:55,border:!1,bodyStyle:"padding: 10px;",url:"/accounts/ajax_login",waitMsgTarget:!0,errorReader:{read:function(a){return{success:200==a.status,records:[]}}},defaults:{anchor:"100%"},items:[{xtype:"textfield",name:"username",fieldLabel:"Username"},{xtype:"textfield",name:"password",fieldLabel:"Password",inputType:"password"},{xtype:"hidden",name:"csrfmiddlewaretoken",value:this.csrfToken},{xtype:"button",text:"Login",inputType:"submit",handler:b}]}],keys:{key:Ext.EventObject.ENTER,
fn:b}});e.show();var f=e.items.get(0);f.items.get(0).focus(!1,100)}else 405!=b.status&&"/geoserver/rest/styles"!=a&&this.displayXHRTrouble(b)},scope:this});Ext.util.Observable.observeClass(gxp.form.ColorField);gxp.form.ColorField.on({render:function(a){(new Styler.ColorManager).register(a)}});window.onbeforeunload=function(){if(!1===this.fireEvent("beforeunload"))return"If you leave this page, unsaved changes will be lost."}.createDelegate(this);Ext.form.ComboBox.prototype.getListParent=function(){return this.el.up(".x-window")||
document.body};Ext.Window.prototype.shadow=!1;if(!a.map)a.map={};a.map.numZoomLevels=a.map.numZoomLevels||22;GeoExplorer.superclass.constructor.apply(this,arguments);this.mapID=this.initialConfig.id},displayXHRTrouble:function(a){a.status&&Ext.Msg.show({title:this.connErrorTitleText,msg:this.connErrorText+": "+a.status+" "+a.statusText,icon:Ext.MessageBox.ERROR,buttons:{ok:this.connErrorDetailsText,cancel:!0},fn:function(c){if("ok"==c){var b=new Ext.Window({title:a.status+" "+a.statusText,width:400,
height:300,items:{xtype:"container",cls:"error-details",html:a.responseText},autoScroll:!0,buttons:[{text:"OK",handler:function(){b.close()}}]});b.show()}}})},loadConfig:function(a){var c=function(a,b){b.headers={"X-CSRFToken":Ext.util.Cookies.get("csrftoken")}},b=!1,d;for(d in a.sources){var e=a.sources[d];if("gxp_cataloguesource"===e.ptype&&e.url===a.localCSWBaseUrl){b=!0;Ext.apply(e.proxyOptions,{listeners:{beforeload:c}});break}}!1===b&&(a.sources.csw={ptype:"gxp_cataloguesource",url:a.localCSWBaseUrl,
proxyOptions:{listeners:{beforeload:c}}});a.tools=(a.tools||[]).concat({ptype:"gxp_zoom",actionTarget:{target:"paneltbar",index:4}},{ptype:"gxp_navigationhistory",actionTarget:{target:"paneltbar",index:6}},{ptype:"gxp_zoomtoextent",actionTarget:{target:"paneltbar",index:8}},{ptype:"gxp_layermanager",outputConfig:{id:"treecontent",autoScroll:!0,tbar:{id:"treetbar"}},outputTarget:"westpanel"},{ptype:"gxp_zoomtolayerextent",actionTarget:"treecontent.contextMenu"},{ptype:"gxp_addlayers",search:!0,actionTarget:"treetbar",
createExpander:function(){return new GeoExplorer.CapabilitiesRowExpander({ows:a.localGeoServerBaseUrl+"ows"})}},{ptype:"gxp_removelayer",actionTarget:["treetbar","treecontent.contextMenu"]},{ptype:"gxp_layerproperties",layerPanelConfig:{gxp_wmslayerpanel:{rasterStyling:!0}},actionTarget:["treetbar","treecontent.contextMenu"]},{ptype:"gxp_styler",sameOriginStyling:!1,rasterStyling:!0,actionTarget:["treetbar","treecontent.contextMenu"]},{ptype:"gxp_print",openInNewWindow:!0,includeLegend:!0,printCapabilities:window.printCapabilities,
actionTarget:{target:"paneltbar",index:3}},{ptype:"gxp_googleearth",actionTarget:{target:"paneltbar",index:4}});GeoExplorer.superclass.loadConfig.apply(this,arguments)},checkLayerPermissions:function(a){var c=this.tools.gn_layer_editor.actions,b=function(a){for(var b=0;b<c.length;b++)a?c[b].enable():c[b].disable()};Ext.getCmp("treecontent").getSelectionModel().getSelectedNode();if(null==a)b(!1);else{var d=a.getLayer();d instanceof OpenLayers.Layer.WMS&&("/geoserver/wms"==d.url||0==d.url.indexOf(this.localGeoServerBaseUrl.replace(this.urlPortRegEx,
"$1/")))?Ext.Ajax.request({url:"/data/"+d.params.LAYERS+"/ajax-edit-check",method:"POST",success:function(a){200!=a.status?b(!1):(d.displayOutsideMaxExtent=!0,b(!0))},failure:function(){b(!1)}}):b(!1)}},initMapPanel:function(){this.mapItems=[{xtype:"gx_zoomslider",vertical:!0,height:100,plugins:new GeoExt.ZoomSliderTip({template:"<div>"+this.zoomSliderTipText+": {zoom}<div>"})}];!1!==this.useMapOverlay&&this.mapItems.push({xtype:"gxp_scaleoverlay"});this.mapPlugins=[{ptype:"gxp_loadingindicator",
onlyShowOnFirstLoad:!0}];GeoExplorer.superclass.initMapPanel.apply(this,arguments)},initPortal:function(){this.on("beforeunload",function(){if(this.modified)return this.showMetadataForm(),!1},this);this.on("ready",function(){this.mapPanel.layers.on({update:function(){this.modified|=1},add:function(){this.modified|=1},remove:function(){this.modified|=1},scope:this})});var a;this.on("ready",function(){var b=null,c;for(c in this.layerSources)source=this.layerSources[c],source.store&&source instanceof
gxp.plugins.WMSSource&&0===source.url.indexOf("/geoserver/wms")&&(b=c);c=null;for(var f in this.tools){var g=this.tools[f];if("gxp_addlayers"===g.ptype)c=g,c.startSourceId=b,c.catalogSourceKey=b}!this.fromLayer&&!this.mapID&&null!==c&&c.showCapabilitiesGrid();a=Ext.getCmp("treecontent");"gn_layer_editor"in this.tools&&this.tools.gn_layer_editor.getFeatureManager().activate()},this);var c=new Ext.Panel({layout:"fit",id:"westpanel",border:!1,collapseMode:"mini",header:!1,split:!0,region:"west",width:250});
this.toolbar=new Ext.Toolbar({disabled:!0,id:"paneltbar",items:this.createTools()});this.on("ready",function(){var a=this.toolbar.items.filterBy(function(a){return a.initialConfig&&a.initialConfig.disabled});this.toolbar.enable();a.each(function(a){a.disable()})},this);this.on("ready",function(){var a=new OpenLayers.Control.MousePosition({displayProjection:new OpenLayers.Projection("EPSG:4326"),numDigits:4,prefix:"E  ",separator:" , N ",autoActivate:!0});this.mapPanel.map.addControl(a);a.moveTo({x:"100%",
y:0})},this);this.googleEarthPanel=new gxp.GoogleEarthPanel({mapPanel:this.mapPanel,listeners:{beforeadd:function(a){return"background"!==a.get("group")},show:function(){a.contextMenu.on("beforeshow",OpenLayers.Function.False);this.on("beforelayerselectionchange",OpenLayers.Function.False);Ext.getCmp("treetbar").disable()},hide:function(){var a=Ext.getCmp("treecontent");a&&(a.contextMenu.un("beforeshow",OpenLayers.Function.False),this.un("beforelayerselectionchange",OpenLayers.Function.False),Ext.getCmp("treetbar").enable())},
scope:this}});this.mapPanelContainer=new Ext.Panel({layout:"card",region:"center",defaults:{border:!1},items:[this.mapPanel,this.googleEarthPanel],activeItem:0});var b=new Ext.Panel({region:"north",autoHeight:!0,contentEl:"header-wrapper"});Lang.registerLinks();this.portalItems=[b,{region:"center",xtype:"container",layout:"fit",border:!1,hideBorders:!0,items:{layout:"border",deferredRender:!1,tbar:this.toolbar,items:[this.mapPanelContainer,c],ref:"../../main"}}];GeoExplorer.superclass.initPortal.apply(this,
arguments)},createTools:function(){var a=[new Ext.Button({tooltip:this.saveMapText,handler:this.showMetadataForm,scope:this,iconCls:"icon-save"}),new Ext.Action({tooltip:this.publishActionText,handler:this.makeExportDialog,scope:this,iconCls:"icon-export",disabled:!this.mapID}),"-"];this.on("saved",function(){a[1].enable();this.modified^=this.modified&1},this);return a},makeExportDialog:function(){(new Ext.Window({title:this.publishActionText,layout:"fit",width:380,autoHeight:!0,items:[{xtype:"gxp_embedmapdialog",
url:this.rest+this.mapID+"/embed"}]})).show()},initMetadataForm:function(){var a=new Ext.form.TextField({width:"95%",fieldLabel:this.metaDataMapTitle,value:this.about.title,allowBlank:!1,enableKeyEvents:!0,listeners:{valid:function(){d.enable();e.enable()},invalid:function(){d.disable();e.disable()}}}),c=new Ext.form.TextArea({width:"95%",height:200,fieldLabel:this.metaDataMapAbstract,value:this.about["abstract"]}),b=new Ext.FormPanel({bodyStyle:{padding:"5px"},labelAlign:"top",items:[a,c]});b.enable();
var d=new Ext.Button({text:this.metadataFormSaveAsCopyText,disabled:!this.about.title,handler:function(){this.about.title=a.getValue();this.about["abstract"]=c.getValue();this.metadataForm.hide();this.save(!0)},scope:this}),e=new Ext.Button({text:this.metadataFormSaveText,disabled:!this.about.title,handler:function(){this.about.title=a.getValue();this.about["abstract"]=c.getValue();this.metadataForm.hide();this.save()},scope:this});this.metadataForm=new Ext.Window({title:this.metaDataHeader,closeAction:"hide",
items:b,modal:!0,width:400,autoHeight:!0,bbar:["->",d,e,new Ext.Button({text:this.metadataFormCancelText,handler:function(){a.setValue(this.about.title);c.setValue(this.about["abstract"]);this.metadataForm.hide()},scope:this})]})},showMetadataForm:function(){this.metadataForm||this.initMetadataForm();this.metadataForm.show()},updateURL:function(){return this.rest+this.mapID+"/data"},save:function(a){var c=this.getState();!this.mapID||a?Ext.Ajax.request({url:this.rest,method:"POST",jsonData:c,success:function(a){a=
a.getResponseHeader("Location");a=a.replace(/^\s*/,"");a=a.replace(/\s*$/,"");this.mapID=a=a.match(/[\d]*$/)[0];this.fireEvent("saved",a)},scope:this}):Ext.Ajax.request({url:this.updateURL(),method:"PUT",jsonData:c,success:function(){this.fireEvent("saved",this.mapID)},scope:this})}});Ext.namespace("GeoExplorer");
GeoExplorer.Viewer=Ext.extend(GeoExplorer,{loadConfig:function(a){var c,b;for(b in a.sources){c=a.sources[b];if(!c.ptype||/wmsc?source/.test(c.ptype))c.forceLazy=!1===a.useCapabilities;if(!1===a.useToolbar){c=!0;for(var d,e=a.map.layers.length-1;0<=e;--e)d=a.map.layers[e],d.source==b&&(!1===d.visibility?a.map.layers.remove(d):c=!1);c&&delete a.sources[b]}}if(!1!==a.useToolbar)a.tools=(a.tools||[]).concat({ptype:"gxp_styler",id:"styler",rasterStyling:!0,actionTarget:void 0});GeoExplorer.superclass.loadConfig.apply(this,
arguments)},initPortal:function(){if(!1!==this.useToolbar)this.toolbar=new Ext.Toolbar({xtype:"toolbar",region:"north",autoHeight:!0,disabled:!0,items:this.createTools()}),this.on("ready",function(){this.toolbar.enable()},this);this.mapPanelContainer=new Ext.Panel({layout:"card",region:"center",ref:"../main",tbar:this.toolbar,defaults:{border:!1},items:[this.mapPanel],ref:"../main",activeItem:0});window.google&&google.earth&&this.mapPanelContainer.add(new gxp.GoogleEarthPanel({mapPanel:this.mapPanel,
listeners:{beforeadd:function(a){return"background"!==a.get("group")}}}));this.portalItems=[this.mapPanelContainer];GeoExplorer.superclass.initPortal.apply(this,arguments)},addLayerSource:function(a){GeoExplorer.superclass.addLayerSource.apply(this,arguments)},createTools:function(){var a=GeoExplorer.Viewer.superclass.createTools.apply(this,arguments),c=new Ext.Button({tooltip:"Layer Switcher",iconCls:"icon-layer-switcher",menu:new gxp.menu.LayerMenu({layers:this.mapPanel.layers})});a.unshift("-");
a.unshift(c);c=new Ext.Button({tooltip:"About this map",iconCls:"icon-about",handler:this.displayAppInfo,scope:this});a.push("->");a.push(c);return a}});Ext.namespace("GeoExplorer");
GeoExplorer.CapabilitiesRowExpander=Ext.extend(Ext.grid.RowExpander,{abstractText:"UT:Abstract:",attributionEmptyText:"UT: No attribution information is provided for this layer.",attributionText:"UT:Provided by:",downloadText:"UT:Download:",keywordEmptyText:"UT: No keywords are listed for this layer.",keywordText:"UT:Keywords:",metadataEmptyText:"UT: No metadata URLs are defined for this layer.",metadataText:"UT:Metadata Links:",ows:null,constructor:function(a){a=a||{};a.tpl=a.tpl||this.getDefaultTemplate();
var c,b;c=this;b=Ext.apply({ows:function(){return c.ows}},this.templateLibrary);b.metadataEmptyText=this.metadataEmptyText;b.keywordEmptyText=this.keywordEmptyText;b.attributionEmptyText=this.attributionEmptyText;Ext.apply(a.tpl,b);GeoExplorer.CapabilitiesRowExpander.superclass.constructor.call(this,a);this.on("beforeexpand",function(a,b,c){a=b.store;if(a instanceof GeoExt.data.WMSCapabilitiesStore){var g=a.reader.raw.capability.request.describelayer;g&&Ext.Ajax.request({url:g.href,params:{REQUEST:"DescribeLayer",
VERSION:a.reader.raw.version,LAYERS:b.get("layer").params.LAYERS},disableCaching:!1,success:function(a){a=(new OpenLayers.Format.WMSDescribeLayer).read(a.responseXML&&a.responseXML.documentElement?a.responseXML:a.responseText);a.length&&"WFS"===a[0].owsType&&Ext.get(Ext.query(".wfs.nodisplay",c)).removeClass("nodisplay")},failure:function(){},scope:this});return!0}},this)},getDefaultTemplate:function(){return new Ext.Template("<p><b>"+this.abstractText+"</b> {abstract}</p><p><b>"+this.attributionText+
"</b> {attribution:this.attributionLink}</p><p><b>"+this.metadataText+"</b> {metadataURLs:this.metadataLinks}</p><p><b>"+this.keywordText+'</b> {keywords:this.keywordList}</p><span class="{formats:this.showDownload}"><p><b>'+this.downloadText+'</b> <a class="download pdf" target="_blank" href="{name:this.pdfUrl}">PDF</a>, <a class="download kml" target="_blank" href="{name:this.kmlUrl}">KML</a>, <a class="download geotiff" target="_blank" href="{name:this.geoTiffUrl}">GeoTIFF</a><span class="wfs nodisplay">, <a class="download shp" target="_blank" href="{name:this.shpUrl}">SHP (ZIP)</a></span></p></span>')},
templateLibrary:{wmsParams:function(a,c,b){if(null!=c.llbbox){var b=b||8.5/11,d,e,f;d=(c.llbbox[2]-c.llbbox[0])/(c.llbbox[3]-c.llbbox[1]);f=e=1;d>b?f=d/b:e=b/d;return{service:"wms",request:"GetMap",bbox:this.adjustBounds(e,f,c.llbbox).toString(),layers:a,srs:"EPSG:4326",width:425,height:550}}},adjustBounds:function(a,c,b){var d,e,f;d=b[2]-b[0];e=b[3]-b[1];f=(b[2]+b[0])/2;b=(b[3]+b[1])/2;return[f-a*d/2,b-c*e/2,f+a*d/2,b+c*e/2]},wfsParams:function(a){return{service:"wfs",request:"GetFeature",typeName:a}},
showDownload:function(a){return a&&-1!==a.indexOf("application/vnd.google-earth.kmz+xml")&&-1!==a.indexOf("application/pdf")&&-1!==a.indexOf("image/geotiff")?"":"nodisplay"},shpUrl:function(a,c){var b=Ext.apply(this.wfsParams(a,c),{outputFormat:"SHAPE-ZIP"});return this.ows()+"?"+Ext.urlEncode(b)},pdfUrl:function(a,c){var b=Ext.apply(this.wmsParams(a,c),{format:"application/pdf"});return this.ows()+"?"+Ext.urlEncode(b)},kmlUrl:function(a,c){var b=Ext.apply(this.wmsParams(a,c),{format:"application/vnd.google-earth.kmz+xml",
height:2048,width:2048},1);return this.ows()+"?"+Ext.urlEncode(b)},geoTiffUrl:function(a,c){var b=Ext.apply(this.wmsParams(a,c),{format:"image/geotiff"});return this.ows()+"?"+Ext.urlEncode(b)},metadataLinks:function(a){if(null==a||0===a.length)return"<em>"+this.metadataEmptyText+"</em>";var c,b,d;b=[];for(c=0,d=a.length;c<d;c++)b.push('<a target="_blank" href="'+a[c].href+'"> '+a[c].type+"</a>");return b.join(", ")},keywordList:function(a){return null==a||0===a.length?"<em>"+this.keywordEmptyText+
"</em>":a.join(", ")},attributionLink:function(a){return null==a||null==a.href?"<em>"+this.attributionEmptyText+"</em>":'<a href="'+a.href+'"> '+a.title+"</a>"}}});Ext.namespace("GeoNode");
GeoNode.BatchDownloadWidget=Ext.extend(Ext.util.Observable,{downloadingText:"UT: Downloading...",cancelText:"UT: Cancel",windowMessageText:"UT: Please wait",constructor:function(a){Ext.apply(this,a);this.beginDownload()},beginDownload:function(){var a=this;Ext.Ajax.request({url:this.begin_download_url,method:"POST",params:{layer:this.layers,format:this.format},success:function(c){c=Ext.util.JSON.decode(c.responseText);a.monitorDownload(c.id)}})},monitorDownload:function(a){var c,b=this,d=new Ext.ProgressBar({text:this.downloadingText}),
e=function(){Ext.Ajax.request({url:b.stop_download_url+a,method:"GET",success:function(){clearInterval(c)},failure:function(){clearInterval(c)}})},f=new Ext.Window({width:250,height:100,plain:!0,modal:!0,closable:!1,hideBorders:!0,items:[d],buttons:[{text:this.cancelText,handler:function(){e();f.hide()}}]});c=setInterval(function(){Ext.Ajax.request({url:b.begin_download_url+"?id="+a,method:"GET",success:function(e){e=Ext.util.JSON.decode(e.responseText);"FINISHED"===e.process.status?(clearInterval(c),
d.updateProgress(1,"Done....",!0),f.close(),location.href=b.download_url+a):d.updateProgress(e.process.progress/100,b.downloadingText,!0)},failure:function(){clearInterval(c);f.close()}})},1E3);f.show()}});Ext.namespace("GeoNode");
GeoNode.BoundingBoxWidget=Ext.extend(Ext.util.Observable,{viewerConfig:null,constructor:function(a){Ext.apply(this,a);this.doLayout()},doLayout:function(){var a=Ext.get(this.renderTo),c={proxy:this.proxy,useCapabilities:!1,useBackgroundCapabilities:!1,useToolbar:!1,useMapOverlay:!1,portalConfig:{collapsed:!0,border:!1,height:300,renderTo:a.query(".bbox-expand")[0]},listeners:{ready:function(){this._ready=!0},scope:this}},c=Ext.apply(c,this.viewerConfig);this.viewer=new GeoExplorer.Viewer(c);this.enabledCB=
a.query(".bbox-enabled input")[0];this.disable();Ext.get(this.enabledCB).on("click",function(){!0==this.enabledCB.checked?this.enable():this.disable()},this)},isActive:function(){return!0==this.enabledCB.checked},hasConstraint:function(){return this.isActive()},applyConstraint:function(a){if(this.hasConstraint()){var c=this.viewer.mapPanel.map.getExtent();c.transform(new OpenLayers.Projection(this.viewerConfig.map.projection),new OpenLayers.Projection("EPSG:4326"));a.bbox=c.toBBOX()}else this._ready&&
delete a.bbox},initFromQuery:function(a,c){if(c.bbox){var b=OpenLayers.Bounds.fromString(c.bbox);if(b){b.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection(this.viewerConfig.map.projection));var d=function(){var a=this.viewer.mapPanel.map;a.events.register("moveend",this,function(){a.events.unregister("moveend",this,arguments.callee);a.zoomToExtent(b,!0)});this.enable()};if(this._ready)d.call(this);else this.viewer.on("ready",d,this)}}},enable:function(){this.enabledCB.checked=
!0;this.viewer.portal&&this.viewer.portal.expand()},disable:function(){this.enabledCB.checked=!1;this.viewer.portal&&this.viewer.portal.collapse()}});Ext.namespace("GeoNode");
GeoNode.DataCart=Ext.extend(Ext.util.Observable,{selectedLayersText:"UT: Selected Layers",emptySelectionText:"UT: No Layers Selected",titleText:"UT: Title",clearSelectedButtonText:"UT: Clear Selected",clearAllButtonText:"UT: Clear All",constructor:function(a){Ext.apply(this,a);this.doLayout()},getSelectedLayerIds:function(){var a=[];this.grid.selModel.each(function(c){a.push(c.get("name"))});return a},doLayout:function(){var a=Ext.get(this.renderTo);a.update('<div class="selection-table"></div><div class="selection-controls"></div><div class="selection-ops></div>"');
var c=a.query(".selection-controls")[0],b=a.query(".selection-table")[0];a.query(".selection-ops");sm=new Ext.grid.CheckboxSelectionModel({});this.grid=new Ext.grid.GridPanel({store:this.store,viewConfig:{autoFill:!0,forceFit:!0,emptyText:this.emptySelectionText,deferEmptyText:!1},height:150,renderTo:b,selModel:sm,hideHeaders:!0,colModel:new Ext.grid.ColumnModel({defaults:{sortable:!1,menuDisabled:!0},columns:[sm,{dataIndex:"title"}]})});this.store.on("add",function(a,b,c){sm.selectRow(c,!0)});a=
new Ext.Button({text:this.clearSelectedButtonText});a.on("click",function(){sm.each(function(a){a=this.store.indexOfId(a.id);0<=a&&this.store.removeAt(a)},this);this.store.reselect()},this);b=new Ext.Button({text:this.clearAllButtonText});b.on("click",function(){this.store.removeAll();this.store.reselect()},this);(new Ext.Panel({frame:!1,border:!1,layout:new Ext.layout.HBoxLayout({defaultMargins:{top:10,bottom:10,left:0,right:0}}),items:[a,b]})).render(c)}});Ext.namespace("GeoNode");
GeoNode.DataCartOps=Ext.extend(Ext.util.Observable,{failureText:"UT: Operation Failed",noLayersText:"UT: No layers are currently selected.",constructor:function(a){Ext.apply(this,a);this.doLayout()},doLayout:function(){var a=Ext.get(this.renderTo),c=Ext.get(a.query("a.create-map")[0]);this.createMapForm=Ext.get(a.query("#create_map_form")[0]);c.on("click",function(a){a.preventDefault();(a=this.cart.getSelectedLayerIds())&&a.length?this.createNewMap(a):Ext.MessageBox.alert(this.failureText,this.noLayersText)},
this);batch_links=a.query("a.batch-download");for(a=0;a<batch_links.length;a++)Ext.get(batch_links[a]).on("click",function(a,c){a.preventDefault();var e=this.cart.getSelectedLayerIds();if(e&&e.length){var f=Ext.get(c).getAttribute("href").substr(1);this.batchDownload(e,f)}else Ext.MessageBox.alert(this.failureText,this.noLayersText)},this)},createNewMap:function(a){for(var c=[],b=0;b<a.length;b++)c.push({tag:"input",type:"hidden",name:"layer",value:a[b]});c.push({tag:"input",type:"hidden",name:"csrfmiddlewaretoken",
value:Ext.util.Cookies.get("csrftoken")});Ext.DomHelper.overwrite(this.createMapForm,{tag:"div",cn:c});this.createMapForm.dom.submit()},batchDownload:function(a,c){new GeoNode.BatchDownloadWidget({layers:a,format:c,begin_download_url:this.begin_download_url,stop_download_url:this.stop_download_url,download_url:this.download_url})}});Ext.namespace("GeoNode");
GeoNode.DataCartStore=Ext.extend(Ext.data.Store,{constructor:function(a){this.selModel=a.selModel;this.reselecting=!1;this.selModel.on("rowselect",function(a,b,d){!0!=this.reselecting&&-1==this.indexOfId(d.id)&&this.add([d])},this);this.selModel.on("rowdeselect",function(a,b,d){!0!=this.reselecting&&(b=this.indexOfId(d.id),-1!=b&&this.removeAt(b))},this);GeoNode.DataCartStore.superclass.constructor.call(this,a)},reselect:function(){this.reselecting=!0;this.selModel.clearSelections();var a=this.selModel.grid.store;
this.each(function(c){c=a.indexOfId(c.id);-1!=c&&this.selModel.selectRow(c,!0);return!0},this);this.reselecting=!1}});Ext.namespace("GeoNode");
GeoNode.MapSearchTable=Ext.extend(Ext.util.Observable,{autoExpandColumn:"title",titleHeaderText:"UT: Title",contactHeaderText:"UT: Contact",lastModifiedHeaderText:"UT: Last Modified",mapAbstractLabelText:"UT: Abstract",mapLinkLabelText:"UT:View this Map",previousText:"UT: Prev",nextText:"UT: Next",ofText:"UT: of",noResultsText:"UT: Your search did not match any items.",searchLabelText:"UT: Search Maps",searchButtonText:"UT: Search",showingText:"UT: Showing",loadingText:"UT: Loading",permalinkText:"UT: permalink",
constructor:function(a){this.addEvents("load");Ext.apply(this,a);this.initFromQuery();this.loadData()},loadData:function(){this.searchStore=new Ext.data.JsonStore({url:this.searchURL,root:"rows",idProperty:"name",remoteSort:!0,totalProperty:"total",fields:[{name:"id",mapping:"id"},{name:"title",type:"string"},{name:"abstract",type:"string"},{name:"detail",type:"string"},{name:"owner",type:"string"},{name:"owner_detail",type:"string"},{name:"last_modified",type:"string"}]});this.searchStore.on("load",
function(){this.updateControls();this.fireEvent("load",this)},this);this.doLayout();this.doSearch()},initFromQuery:function(){if(!this.searchParams)this.searchParams={};if(!this.searchParams.start)this.searchParams.start=0;if(!this.searchParams.limit)this.searchParams.limit=25;if(this.constraints)for(var a=0;a<this.constraints.length;a++)this.constraints[a].initFromQuery(this,this.searchParams)},doSearch:function(){this.searchParams.start=0;if(this.constraints)for(var a=0;a<this.constraints.length;a++)this.constraints[a].applyConstraint(this.searchParams);
this._search(this.searchParams)},_search:function(a){this.disableControls();this.searchStore.load({params:a});this.updatePermalink(a)},loadNextBatch:function(){this.searchParams.start+=this.searchParams.limit;this._search(this.searchParams)},loadPrevBatch:function(){this.searchParams.start-=this.searchParams.limit;if(0>this.searchParams.start)this.searchParams.start=0;this._search(this.searchParams)},disableControls:function(){this.nextButton.setDisabled(!0);this.prevButton.setDisabled(!0);this.pagerLabel.setText(this.loadingText)},
updateControls:function(){var a=this.searchStore.getTotalCount();0<this.searchParams.start?this.prevButton.setDisabled(!1):this.prevButton.setDisabled(!0);this.searchParams.start+this.searchParams.limit<a?this.nextButton.setDisabled(!1):this.nextButton.setDisabled(!0);var c=this.searchParams.start+1,b=c+this.searchParams.limit-1;b>a&&(b=a);this.pagerLabel.setText(this.showingText+" "+c+"-"+b+" "+this.ofText+" "+a)},updatePermalink:function(){if(this.permalink)this.permalink.href=Ext.urlAppend(this.permalinkURL,
Ext.urlEncode(this.searchParams))},updateQuery:function(){this.searchParams.q=this.queryInput.getValue();this.doSearch()},hookupSearchButtons:function(a){for(var a=Ext.get(a).query(".search-button"),c=0;c<a.length;c++){var b=a[c].innerHTML||this.searchButtonText;Ext.get(a[c]).update("");(new Ext.Button({text:b,renderTo:a[c]})).on("click",this.doSearch,this)}},doLayout:function(){var a=Ext.get(this.renderTo);a.update('<div class="search-results"><div class="search-input"></div><div class="search-table"></div><div class="search-controls"></div></div>');
var c=a.query(".search-input")[0],b=a.query(".search-table")[0],a=a.query(".search-controls")[0],d=new Ext.Template("<p><b>"+this.mapAbstractLabelText+':</b> {abstract}</p><p><a href="/maps/{id}">'+this.mapLinkLabelText+"</a></p>"),e=new Ext.grid.RowExpander({tpl:d});e.on("expand",function(a,b,c){Ext.select("a",Ext.get(c)).on("click",function(a){a.stopPropagation()})});tableCfg={store:this.searchStore,plugins:[e],autoExpandColumn:"title",viewConfig:{autoFill:!0,forceFit:!0,emptyText:this.noResultsText,
listeners:{refresh:function(a){Ext.select("a",Ext.get(a.mainBody)).on("click",function(a){a.stopPropagation()})},rowsinserted:function(a,b,c){for(;b<c;b++)Ext.select("a",Ext.get(a.getRow(b))).on("click",function(a){a.stopPropagation()})},rowupdated:function(a,b){Ext.select("a",Ext.get(a.getRow(b))).on("click",function(a){a.stopPropagation()})}}},autoHeight:!0,renderTo:b,listeners:{rowdblclick:function(a,b){var c=a.store.getAt(b);if(null!=c)location.href=c.get("detail")},rowclick:function(a,b){e.toggleRow(b)},
beforerender:function(a){a.on("render",function(){a.getView().mainBody.un("mousedown",e.onMouseDown,e)})}}};b=new Ext.grid.ColumnModel({defaults:{menuDisabled:!0,sortable:!0},columns:[e,{header:this.titleHeaderText,dataIndex:"title",id:"title",renderer:function(a,b,c){return(b=c.get("detail"))?'<a href="'+b+'">'+a+"</a>":a}},{header:this.contactHeaderText,dataIndex:"owner",id:"owner",renderer:function(a,b,c){return(b=c.get("owner_detail"))?'<a href="'+b+'">'+a+"</a>":a}},{header:this.lastModifiedHeaderText,
dataIndex:"last_modified",id:"last_modified",renderer:function(a){dt=Date.parseDate(a,"c");return dt.format("F j, Y")}}]});tableCfg.colModel=b;this.table=new Ext.grid.GridPanel(tableCfg);this.queryInput=new Ext.form.TextField({fieldLabel:this.searchLabelText,name:"search",allowBlank:!0,width:350});this.queryInput.on("specialkey",function(a,b){b.getKey()==b.ENTER&&this.updateQuery()},this);b=new Ext.Button({text:this.searchButtonText});b.on("click",this.updateQuery,this);(new Ext.Panel({frame:!1,border:!1,
layout:new Ext.layout.HBoxLayout({defaultMargins:{top:10,bottom:10,left:0,right:10}}),items:[this.queryInput,b]})).render(c);this.prevButton=new Ext.Button({text:this.previousText});this.prevButton.on("click",this.loadPrevBatch,this);this.nextButton=new Ext.Button({text:this.nextText});this.nextButton.on("click",this.loadNextBatch,this);this.pagerLabel=new Ext.form.Label({text:""});(new Ext.Panel({frame:!1,border:!1,layout:new Ext.layout.HBoxLayout({defaultMargins:{top:10,bottom:10,left:0,right:10}}),
items:[this.prevButton,this.nextButton,this.pagerLabel]})).render(a);this.permalink=Ext.query("a.permalink")[0];this.disableControls();this.searchParams.q&&this.queryInput.setValue(this.searchParams.q);this.updatePermalink()}});Ext.namespace("GeoNode");
GeoNode.SearchTableRowExpander=Ext.extend(Ext.grid.RowExpander,{errorText:"UT: Unable to fetch layer details.",loadingText:"UT: Loading...",constructor:function(a){this.fetchURL=a.fetchURL;GeoNode.SearchTableRowExpander.superclass.constructor.call(this,a)},getRowClass:function(a,c,b){b.cols-=1;return this.state[a.id]?"x-grid3-row-expanded":"x-grid3-row-collapsed"},fetchBodyContent:function(a,c,b){this.enableCaching||this._fetchBodyContent(a,c,b);var d=this.bodyContent[c.id];d?a.innerHTML=d:this._fetchBodyContent(a,
c,b)},_fetchBodyContent:function(a,c){a.innerHTML=this.loadingText;var b=this.fetchURL+"?uuid="+c.get("uuid"),d=this;Ext.Ajax.request({url:b,method:"GET",success:function(b){b=b.responseText;a.innerHTML=b;d.bodyContent[c.id]=b},failure:function(){a.innerHTML=d.errorText}})},beforeExpand:function(a,c,b){return!1!==this.fireEvent("beforeexpand",this,a,c,b)?(this.fetchBodyContent(c,a,b),!0):!1}});Ext.namespace("GeoNode");
GeoNode.UserSelector=Ext.extend(Ext.util.Observable,{constructor:function(a){Ext.apply(this,a);this.initUserStore();this.panel=this.doLayout()},initUserStore:function(){if(!this.userstore){var a={proxy:new Ext.data.HttpProxy({url:this.userLookup,method:"POST"}),reader:new Ext.data.JsonReader({root:"users",totalProperty:"count",fields:[{name:"username"}]})};Ext.apply(a,this.availableUserConfig||{});this.userstore=new Ext.data.Store(a);this.userstore.load({params:{query:""}})}if(!this.store)this.store=
new Ext.data.ArrayStore({idIndex:0,fields:["username"],data:[]})},doLayout:function(){function a(){var a=this.availableUsers.getValue(),b=this.availableUsers.store.findExact("username",a);-1!=b&&-1==this.selectedUsers.store.findExact("username",a)&&(this.selectedUsers.store.add([this.availableUsers.store.getAt(b)]),this.availableUsers.reset())}var c=this.owner,b=function(){function a(){f.getEl().on("mousedown",b,this,{delegate:"button"})}function b(a,d){var e=f.findItemFromChild(d),h=f.indexOf(e);
f.store.getAt(h).get("username")!==c&&f.store.removeAt(f.indexOf(e))}var f;return{init:function(b){f=b;f.on("render",a)}}}();this.selectedUsers=new Ext.DataView({store:this.store,itemSelector:"div.user_item",tpl:new Ext.XTemplate('<div><tpl for="."> <div class="x-btn user_item"><button class="icon-removeuser remove-button">&nbsp;</button>{username}</div></tpl></div>'),plugins:[b],autoHeight:!0,multiSelect:!0});this.addButton=new Ext.Button({iconCls:"icon-adduser",handler:a,scope:this});this.availableUsers=
new Ext.form.ComboBox({width:180,store:this.userstore,typeAhead:!0,minChars:0,align:"right",border:"false",displayField:"username",emptyText:gettext("Add user..."),listeners:{scope:this,select:a}});return new Ext.Panel({border:!1,renderTo:this.renderTo,items:[this.selectedUsers,{layout:"hbox",border:!1,items:[this.addButton,this.availableUsers]}]})},setDisabled:function(a){this.selectedUsers.setDisabled(a);this.availableUsers.setDisabled(a);this.addButton.setDisabled(a)}});