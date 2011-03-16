$(function(){
  $("label").inFieldLabels();

  function provision() {
    var data = {};
    $(['username', 'password', 'url']).each(function(i, input) {
      data[input] = $("#" + input).val();
    })
    
    $.post("/provision", data, function(data) {
      $('body').append(JSON.stringify(data));
    })
    
  }
  
  $("input").keydown(function(e) {
     if(e.keyCode == 13) provision();
  });

  $('.button').click( provision );
})
