$.couch.app(function(app) {
  var thresholdData=[];
  var path="";
  var channeldb="/slowcontrol-channeldb/_design/slowcontrol/_view/recent";
  var options="?descending=true&limit=1";
  var recents=["/_view/recent1","/_view/recent2","/_view/recent3","/_view/recent4"];
  var channelNames;
  var sizes={};
  var names=[];
  var deltav="/_view/deltav";

  var retrieveSizes = function(callback){
    $.getJSON(path+channeldb+options,function(result){
      sizes=result.rows[0].value;
      if(callback){
        callback();
      }
    });
  };

  var thresholdString=function(channelid){
    var outputString = "<div class='wideColumn'>"
      +   "<div class='wide'>" 
      +     "<div class='wide set' id='name"
      +       channelid + "'><\/div>"
      +     "<div class='wide present'>Present Thresholds<\/div>"
      +     "<div class='wide approved'>Approved Thresholds<\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<input class='narrow set' id='lolo"
      +       channelid + "' data-role='none' \/>"
      +     "<div class='narrow present' id='lolo_present"
      +       channelid + "'><\/div>"
      +     "<div class='narrow approved' id='lolo_approved"
      +       channelid + "'><\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<input class='narrow set' id='lo"
      +       channelid + "' data-role='none' \/>"
      +     "<div class='narrow present' id='lo_present"
      +       channelid + "'><\/div>"
      +     "<div class='narrow approved' id='lo_approved"
      +       channelid + "'><\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<div class='narrow set realvalue' id='present"
      +       channelid + "'><\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<input class='narrow set' id='hi"
      +       channelid + "' data-role='none' \/>"
      +     "<div class='narrow present' id='hi_present"
      +       channelid + "'><\/div>"
      +     "<div class='narrow approved' id='hi_approved"
      +       channelid + "'><\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<input class='narrow set' id='hihi"
      +       channelid + "' data-role='none' \/>"
      +     "<div class='narrow present' id='hihi_present"
      +       channelid + "'><\/div>"
      +     "<div class='narrow approved' id='hihi_approved"
      +       channelid + "'><\/div>"
      +   "<\/div>"
      + "<\/div>"
      + "<div class='narrowColumn'>"
      +   "<div class='narrow'>"
      +     "<input type='checkbox' id='isEnabled"
      +       channelid + "' data-role='none' \/>"
      +   "<\/div>"
      + "<\/div>";
    return outputString;
  };

  var makehtml = function(){
    var channelid="";
    for (var ios = 0; ios<sizes.ioss.length-1; ios++){
      for (var card = 0; card<sizes.ioss[ios].cards.length; card++){
        for (var channel = 0; channel<sizes.ioss[ios].cards[card].channels.length; channel++){
          channelid = "_ios"+ios+"card"+card+"channel"+channel;
          type=sizes.ioss[ios].cards[card].channels[channel].type
          $("#everything").append("<div class='channel' id='all"+ channelid + "'>");

          $("#all"+channelid).append(thresholdString(channelid));
        }
      }
    }
    for (var channel = 0; channel<sizes.deltav.length; channel++){
      channelid = "_deltav"+channel;
      $("#everything").append("<div class='channel' id='all"+ channelid + "'>");
      $("#all"+channelid).append(thresholdString(channelid));
    }
  };


  var unusedChannel = function(channelstuff){
    var unused = false;
      if (channelstuff.type=="spare"){
        unused = true;
      }
      if (channelstuff.type=="test"){
        unused = true;
      }
      if (channelstuff.signal=="reset"){
        unused = true;
      }
      if (channelstuff.signal=="disable"){
        unused = true;
      }
      if (channelstuff.signal=="enable"){
        unused = true;
      }
    return unused;
  };


  var fillNames = function(){
    var nameindex=0;
    for (var ios = 0; ios<sizes.ioss.length-1; ios++){
      for (var card = 0; card<sizes.ioss[ios].cards.length; card++){
        for (var channel = 0; channel<sizes.ioss[ios].cards[card].channels.length; channel++){
          nameText="";
          if(sizes.ioss[ios].cards[card].channels[channel].type){
            nameText += sizes.ioss[ios].cards[card].channels[channel].type;
          }
          if(sizes.ioss[ios].cards[card].channels[channel].id){
            nameText += " "+ sizes.ioss[ios].cards[card].channels[channel].id;
          }
          if(sizes.ioss[ios].cards[card].channels[channel].signal){
            nameText += " "+sizes.ioss[ios].cards[card].channels[channel].signal;
          }
          if(sizes.ioss[ios].cards[card].channels[channel].unit){
            nameText += " ("+sizes.ioss[ios].cards[card].channels[channel].unit+")";
          }
          names[nameindex]={
            "name": nameText,
            "ios": ios,
            "card": card,
            "channel": channel
          };
          if (!unusedChannel(sizes.ioss[ios].cards[card].channels[channel])){
            $("#name_dropdown").append("<option data-role='none' value="+nameindex +">" + names[nameindex].name + "<\/option>");
            // because plots.js recreates the names information, it's easier to make names[] include unused channels but only display used ones in name_dropdown.  If I ever combine plots.js with slowloader and slowrunner, this can be improved.
          }
          nameindex++;
        }
      }
    }
    for (var channel = 0; channel<sizes.deltav.length; channel++){
      names[nameindex] = {
        "name": ""+sizes.deltav[channel].type+" "+sizes.deltav[channel].id+" "+sizes.deltav[channel].signal+ " ("+sizes.deltav[channel].unit+")",
        "type": sizes.deltav[channel].type,
        "id": sizes.deltav[channel].id
      };
      $("#name_dropdown").append("<option data-role='none' value="+nameindex +">" + names[nameindex].name + "<\/option>");
      nameindex++;
    }
    for (var ios=0; ios<sizes.ioss.length-1; ios++){
      for (var card=0; card<sizes.ioss[ios].cards.length; card++){
        for (var channel=0; channel<sizes.ioss[ios].cards[card].channels.length; channel++){
          var nametext="";
          if (sizes.ioss[ios].cards[card].channels[channel].type){
            nametext = nametext + sizes.ioss[ios].cards[card].channels[channel].type + " ";
          }
          if (sizes.ioss[ios].cards[card].channels[channel].id!=null){
            nametext = nametext + sizes.ioss[ios].cards[card].channels[channel].id + " ";
          }
          if (sizes.ioss[ios].cards[card].channels[channel].signal){
            nametext = nametext + sizes.ioss[ios].cards[card].channels[channel].signal + " ";
          }
          if (sizes.ioss[ios].cards[card].channels[channel].unit){
            nametext = nametext + " ("+sizes.ioss[ios].cards[card].channels[channel].unit +")";
          }
          $("#name_ios"+ios+"card"+card+"channel"+channel).text(nametext);
          if (sizes.ioss[ios].cards[card].channels[channel].lolo!=null){
            $("#lolo_ios"+ios+"card"+card+"channel"+channel).val(
            sizes.ioss[ios].cards[card].channels[channel].lolo);
            $("#lo_ios"+ios+"card"+card+"channel"+channel).val(
            sizes.ioss[ios].cards[card].channels[channel].lo);
            $("#hi_ios"+ios+"card"+card+"channel"+channel).val(
            sizes.ioss[ios].cards[card].channels[channel].hi);
            $("#hihi_ios"+ios+"card"+card+"channel"+channel).val(
            sizes.ioss[ios].cards[card].channels[channel].hihi);
          }
          else {
            $("#lolo_ios"+ios+"card"+card+"channel"+channel).attr(
            "disabled",true);
            $("#lo_ios"+ios+"card"+card+"channel"+channel).attr(
            "disabled",true);
            $("#hi_ios"+ios+"card"+card+"channel"+channel).attr(
            "disabled",true);
            $("#hihi_ios"+ios+"card"+card+"channel"+channel).attr(
            "disabled",true);
          }
          if (sizes.ioss[ios].cards[card]
          .channels[channel].isEnabled!=null){ //if property exists
            $("#isEnabled_ios"+ios+"card"+card+"channel"+channel)
            .prop("checked", sizes.ioss[ios].cards[card]
            .channels[channel].isEnabled);
          }
          else {
            $("#isEnabled_ios"+ios+"card"+card+"channel"+channel)
            .attr("disabled", true);
          }
          if (unusedChannel(sizes.ioss[ios].cards[card].channels[channel])){
            $("#all_ios"+ios+"card"+card+"channel"+channel).css({"display":"none"});
          }
        }
      }
    }
    for (var channel=0; channel<sizes.deltav.length; channel++){
      channelid = "_deltav"+channel;
      channelid = channelid.replace(/\s/g, "_");
      $("#name"+channelid).text("" +sizes.deltav[channel].type + " " + sizes.deltav[channel].id + " " + sizes.deltav[channel].signal + " (" +sizes.deltav[channel].unit+ ")");
      $("#lolo" + channelid).val(sizes.deltav[channel].lolo);
      $("#lo" + channelid).val(sizes.deltav[channel].lo);
      $("#hi" + channelid).val(sizes.deltav[channel].hi);
      $("#hihi" + channelid).val(sizes.deltav[channel].hihi);
      if (sizes.deltav[channel].isEnabled!=null){ //if property exists
        $("#isEnabled" + channelid).prop("checked", sizes.deltav[channel].isEnabled);
      }
      else {
        $("#isEnabled" + channelid).attr("disabled", true);
      }
    }
  };


  $("#testaudiobutton").click(function(){
    $("#testaudio").get(0).play();
  });

  retrieveSizes(function(){
    makehtml();
    fillNames();
  });
});
