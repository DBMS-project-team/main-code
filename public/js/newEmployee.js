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
    $('#croppedImage').attr("src",response);
    $('#profileImage').attr("value",response);
    $('#uploadimageModal').modal('hide');
    })
});
$('#defaultImage').click(function(event){
    $('#profileImage').attr("value","default");
    $('#croppedImage').attr("src","img/profile/default.jpg");
});

});  

var change_page = () => {
    location.hash = "/employees";
}
var editUserToggle = () => {
    document.querySelector("#editEmpUser").classList.toggle("d-none");
    document.querySelector("#inputUsername").toggleAttribute("required");
}
