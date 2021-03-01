$(document).ready(function(){

    $image_crop = $('#image_demo').croppie({
    enableExif: true,
    viewport: {
    width:200,
    height:200,
    type:'square' //circle
    },
    boundary:{
    width:300,
    height:300
    }
});

$('#upload_image').on('change', function(){
    $('#defaultModalPrimary').modal('hide');
    var reader = new FileReader();
    reader.onload = function (event) {
    $image_crop.croppie('bind', {
        url: event.target.result
    }).then(function(){
        console.log('jQuery bind complete');
    });
    }
    reader.readAsDataURL(this.files[0]);
    $('#uploadimageModal').modal('show');
});

$('.crop_image').click(function(event){
    $image_crop.croppie('result', {
    type: 'canvas',
    size: "original", 
    quality: 1
    }).then(function(response){
        $('#profileImage').attr("src",response);
        $('#uploadimageModal').modal('hide');
        $('#defaultImage').removeClass('disabled');
        $.post("/auth/form_submit/employees/change_profile",{response,removeImage:false},(data)=>{
            console.log(data);
        })
    })
});

$('#defaultImage').click(function(event){
    $('#defaultModalPrimary').modal('hide');
    $.post("/auth/form_submit/employees/change_profile",{response:null,removeImage:true},(data)=>{
        $('#profileImage').attr("src","img/profile/default.jpg");
        $(this).addClass('disabled');
        console.log(data);
    })
    
});

});  
