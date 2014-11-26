$(document).ready(function(){

  var dialog, form,
  point,
  mapCenter = new google.maps.LatLng(42.700000, 23.333333), map, marker;


  function DisplayCars(){
    var cars, cars_array, source, template, html;

    // set the handlebars parameters
    source  = $("#car-template").html(),
    template = Handlebars.compile(source);

    // Empty the table before displaying the new records
    $("#car_records").html("");

    cars = new Cars;
    cars.getFromLocalStorage();
    cars_array = cars.get();

    cars_array.forEach(function(car, index, array){

         car.id = index;
         html = template(car);

         //append each table row
         $("#car_records").prepend(html);

         $( "#delete" ).button().on( "click", function() {
            var result = confirm("Do you Want to delete the selected record?");

            if (result === true) {
               //Logic to delete the item
               cars.delete($( this ).parent().siblings(".curr_id").text().trim());
               DisplayCars();
               main_map_initialize();
            }
          });

          $( "#update" ).button().on( "click", function() {
             //set form field values
             $("#update_id").text(index);
             $("#brand").val(car["brand"]);
             $("#model").val(car["model"]);
             $("#date").val(car["manufacture_date"]);
             $("#available").attr('checked',car["availability"]);
             $("#registration_number").val(car["registration_number"]);
             update_map_initialize(index);

             // build and open the formn dialog
             update_dialog = $( "#dialog-form" ).dialog({
                autoOpen: false,
                height: 675,
                width: 800,
                modal: true,
                buttons: {
                   "Update Car": updateCar,
                   Cancel: function() {
                      update_dialog.dialog( "close" );
                   }
                },
                close: function() {
                   form[ 0 ].reset();
                   $("input").removeClass( "ui-state-error" );
                }
             });
             form = update_dialog.find( "form" );
             update_dialog.dialog( "open" );
          });

        });
     }


    function addCar() {
      manipulateCar("add");
    }
    function updateCar() {
      manipulateCar("update");
    }

    function manipulateCar(action) {
       var valid = true;
       var cars = new Cars();
       cars.getFromLocalStorage();

       $("input").removeClass( "ui-state-error" );
       valid = (action==="update")||(valid && checkLength( $("#image"), "image", 2, 100 ));
       valid = valid && checkLength( $("#brand"), "brand", 2, 20 );
       valid = valid && checkLength( $("#model"), "model", 2, 20 );
       valid = valid && checkLength( $("#date"), "date", 5, 20 );
       valid = valid && checkLength( $("#registration_number"), "registration number", 5, 16 );
       valid = valid && checkRegexp( $("#registration_number"), /^[A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z][A-Z]$/i, "Insert a valid bulgarian registration number." );
       if (valid && !point){
          valid = false;
          updateTips( "Please, set the location of the car on the map." );
       }

       if ( valid ) {
         var input = document.getElementById("image"),
         element_id =   "#test";

         // if a new image is uploaded
         if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {

               $(element_id).attr("src", e.target.result);
               var bannerImage = document.getElementById("test");
               imgData = getBase64Image(bannerImage);

               var cars = new Cars();
               cars.getFromLocalStorage();
               var car = new Car(imgData, $("#brand").val(), $("#model").val(), $("#date").val(), $("#available").is(':checked'), $("#registration_number").val(), point.lat()||null, point.lng()||null);
               if(action === "add") {
                  cars.add_new(car);
                  dialog.dialog( "close" );
               }
               if(action === "update"){
                  cars.update($("#update_id").text(), car);
                  update_dialog.dialog( "close" );
               }
               main_map_initialize();
               DisplayCars();
            }
            reader.readAsDataURL(input.files[0]);

         } else {
            if(action === "update"){
               cars_array = cars.get();
               var car = new Car(cars_array[$("#update_id").text()].img, $("#brand").val(), $("#model").val(), $("#date").val(), $("#available").is(':checked'), $("#registration_number").val(), point.lat()||null, point.lng()||null);
               cars.update($("#update_id").text(), car);
            }
            main_map_initialize();
            DisplayCars();
            update_dialog.dialog( "close" );
         }
      }
      return valid;
    }


    function map_initialize(){
    //Google map option
       var googleMapOptions = {
          center: mapCenter, // map center
          zoom: 13, //zoom level, 0 = earth view to higher value
          panControl: true, //enable pan Control
          zoomControl: true, //enable zoom control
          zoomControlOptions: {
           style: google.maps.ZoomControlStyle.SMALL //zoom control size
          },
          scaleControl: true, // enable scale control
          mapTypeId: google.maps.MapTypeId.ROADMAP // google map type
       };

       map = new google.maps.Map(document.getElementById("google_map"), googleMapOptions);

       //##### drop a new marker on right click ######
       google.maps.event.addListener(map, 'rightclick', function(event) {
        if (marker) {
          marker.setMap(null);
        }

        marker = new google.maps.Marker({
          position: event.latLng, //map Coordinates where user right clicked
          map: map,
          draggable:true, //set marker draggable
          animation: google.maps.Animation.DROP, //bounce animation
          title:"Hello World!",
          icon: "icons/pin_green.png" //custom pin icon
        });

        // get the position of the marker
        point = marker.getPosition();

        //Content structure of info Window for the Markers
        var contentString = $('<div class="marker-info-win">'+
                           '<div class="marker-inner-win"><span class="info-content">'+
                           '<h1 class="marker-heading">Car Location</h1>'+
                           'This is the location of the car for sale.'+
                           '</span>');
        //Create an infoWindow
        var infowindow = new google.maps.InfoWindow();
        //set the content of infoWindow
        infowindow.setContent(contentString[0]);
        //add click listner to marker which will open infoWindow
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker); // click on marker opens info window
        });
       });
     }


     function main_map_initialize(){
        var googleMapOptions, mainmap, cars, cars_array, contentString;
        //Google map option
        googleMapOptions ={
           center: mapCenter, // map center
           zoom: 13, //zoom level, 0 = earth view to higher value
           panControl: true, //enable pan Control
           zoomControl: true, //enable zoom control
           zoomControlOptions: {
             style: google.maps.ZoomControlStyle.SMALL //zoom control size
           },
           scaleControl: true, // enable scale control
           mapTypeId: google.maps.MapTypeId.ROADMAP // google map type
        };
        mainmap = new google.maps.Map(document.getElementById("main_google_map"), googleMapOptions);

        cars = new Cars();
        cars.getFromLocalStorage();
        cars_array = cars.get();

        // Display all the markers on the map
        cars_array.forEach(function(car, index, array){
           var infowindow,
           markerPosition = new google.maps.LatLng(car.geo_lat, car.geo_long),
           marker = new google.maps.Marker({
              position: markerPosition, //map Coordinates where user right clicked
              map: mainmap,
              draggable:true, //set marker draggable
              animation: google.maps.Animation.DROP, //bounce animation
              title:"Hello World!",
              icon: "icons/pin_green.png" //custom pin icon
           });

           contentString = $('<div class="marker-info-win">'+
                         '<div class="marker-inner-win"><span class="info-content">'+
                         '<h1 class="marker-heading">'+ car.brand +' ' + car.model + '</h1>'+
                         car.registration_number +
                         '</span>');
           //Create an infoWindow
           infowindow = new google.maps.InfoWindow();
           //set the content of infoWindow
           infowindow.setContent(contentString[0]);
           //add click listner to marker which will open infoWindow
           google.maps.event.addListener(marker, 'click', function() {
             infowindow.open(mainmap,marker); // click on marker opens info window
           });
        });
      }

      function update_map_initialize(id){
      //Google map option
      var map, cars, cars_array, marker;
      var googleMapOptions ={
        center: mapCenter, // map center
        zoom: 13, //zoom level, 0 = earth view to higher value
        panControl: true, //enable pan Control
        zoomControl: true, //enable zoom control
        zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL //zoom control size
        },
        scaleControl: true, // enable scale control
        mapTypeId: google.maps.MapTypeId.ROADMAP // google map type
      };
      map = new google.maps.Map(document.getElementById("google_map"), googleMapOptions);

      // set the current marker
      cars = new Cars();
      cars.getFromLocalStorage();
      cars_array = cars.get();
      point = new google.maps.LatLng(cars_array[id].geo_lat, cars_array[id].geo_long);
      marker = new google.maps.Marker({
           position: point, //map Coordinates where user right clicked
           map: map,
           draggable:true, //set marker draggable
           animation: google.maps.Animation.DROP, //bounce animation
           title:"Hello World!",
           icon: "icons/pin_green.png" //custom pin icon
      });

      //##### drop a new marker on right click ######
      google.maps.event.addListener(map, 'rightclick', function(event) {
        if (marker) {
          marker.setMap(null);
        }
        marker = new google.maps.Marker({
          position: event.latLng, //map Coordinates where user right clicked
          map: map,
          draggable:true, //set marker draggable
          animation: google.maps.Animation.DROP, //bounce animation
          title:"Hello World!",
          icon: "icons/pin_green.png" //custom pin icon
        });
        point = marker.getPosition();

        //Content structure of info Window for the Markers
        var contentString = $('<div class="marker-info-win">'+
                    '<div class="marker-inner-win"><span class="info-content">'+
                    '<h1 class="marker-heading">Car Location</h1>'+
                    'This is the location of the car for sale.'+
                    '</span>');
        //Create an infoWindow
        var infowindow = new google.maps.InfoWindow();
        //set the content of infoWindow
        infowindow.setContent(contentString[0]);
        //add click listner to marker which will open infoWindow
        google.maps.event.addListener(marker, 'click', function() {
           infowindow.open(mainmap,marker); // click on marker opens info window
        });
      });
   }


   /*  Actions on LOAD OF THE PAGE  */
   main_map_initialize();
   map_initialize(); // load map
   DisplayCars();

   $( "#create" ).button().on( "click", function() {
     dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 675,
      width:800,
      modal: true,
      buttons: {
      "Add Car": addCar,
      Cancel: function() {
        dialog.dialog( "close" );
      }
      },
      close: function() {
        form[ 0 ].reset();
        $("input").removeClass( "ui-state-error" );
      }
     });
    form = dialog.find( "form" );
    dialog.dialog( "open" );
   });


});



