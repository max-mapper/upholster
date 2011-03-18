$(function(){
  $("label").inFieldLabels();
  
  var resting = "<span class='rightarrow icon'></span>Provision Server"
    , loading = "<span class='loading icon'></span>Contacting your Couch..."

  function provision() {
    $('.button').html(loading);
    
    var data = {};
    $(['username', 'password', 'url']).each(function(i, input) {
      data[input] = $("#" + input).val();
    })
    
    $.post("/provision", data, function(response) {
      var msg;
      if ("error" in response) msg = response.reason;
      if ("doc_write_failures" in response) {
        if (response.doc_write_failures > 0) {
          msg = "Invalid username or password"
        } else {
          msg = 'Monocles installed successfully! View it <a href="http://' + data.url + '/monocles/_design/couchappspora/_rewrite' + '">here</a>'
        }
      }
      $('.button').html(resting);
      $('#notification').html(msg);
    })
  }
  
  $("input").keydown(function(e) {
     if(e.keyCode == 13) provision();
  });

  $('.button').click( provision );
})
