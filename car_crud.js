function Car(img, brand, model, manufacture_date, availability, registration_number, geo_lat, geo_long) {
    this.img = img;
    this.brand = brand;
    this.model = model;
    this.manufacture_date = manufacture_date;
    this.availability = availability;
    this.registration_number = registration_number;
    this.geo_lat = geo_lat;
    this.geo_long = geo_long;

}

function Cars(){
  this.cars_array = [];
}
Cars.prototype.get = function(){
  return this.cars_array;
}
Cars.prototype.sort = function(){
 this.cars_array.sort(function(a, b){
        var x, y;
        if (a.availability === true){
          x = 1 ;
        } else {
          x = 0;
        }
        if (b.availability === true){
          y = 1 ;
        } else {
          y = 0;
        }
        return x-y;
      });
}
Cars.prototype.add_new = function(car) {
  if(this.cars_array){
    this.cars_array.push(car);
    this.sort();
  }
localStorage.setItem("Cars",JSON.stringify(this.cars_array));
}

Cars.prototype.update = function(car_id, car) {
  this.cars_array[car_id] = car;
  this.sort();
  localStorage.setItem("Cars",JSON.stringify(this.cars_array));
}
Cars.prototype.delete = function(car_id) {
   this.cars_array.splice(car_id, 1);
   console.log(JSON.stringify(this.cars_array));
   localStorage.setItem("Cars",JSON.stringify(this.cars_array));
}

Cars.prototype.getFromLocalStorage = function(){
  var localStorage_cars = JSON.parse(localStorage.getItem("Cars"));
  if (localStorage_cars != null){
    this.cars_array = localStorage_cars;
  }
}

