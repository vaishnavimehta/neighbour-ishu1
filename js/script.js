//following is an array of 6 objects each having six properties which are id,title,lat,lng,markSselected,val
var restaurants = [
  {
	id: 16765367,
    title: "Eleven Madison Park",
    lat: 40.7415086000,
    lng: -73.9866285000,
    markSselected: false,
    val: true,
  },
  {
	id: 16774802,
    title: "Patsy's Italian Restaurant",
    lat: 40.765697222,
    lng: -73.9825888889,
    markSselected: false,
    val: true,
  },
  {
	id: 16787124,
    title: "The Smith",
    lat: 40.7553111111,
    lng: -73.9681083333,
    markSselected: false,
    val: true,
  },
  {
	id:16787069,
    title: "Catch",
    lat: 40.7401472222,
    lng: -74.0060666667,
    markSselected: false,
    val: true,
  },
  {
	id: 16789566,
    title: "The Boil",
    lat: 40.7196277778,
    lng: -73.9931111111,
    markSselected: false,
    val: true,
  },
  {
	id: 16776414,
    title: "The River Cafe",
    lat: 40.7034805556,
    lng: -73.9945444444,
    markSselected: false,
    val: true,
  }
];

var vM = function () {
  var self = this;
  self.markArr = [];
  self.sResults = ko.observable();
  self.emsg = ko.observable();
  //creates marker for each restaurant and push it to markArr
  var l = restaurants.length;
  for (var x = 1; x <= l; x++) {
    var restMark = new google.maps.Marker({
		newid: restaurants[x-1].id,
		title: restaurants[x-1].title,
		position: { lat: restaurants[x-1].lat, lng: restaurants[x-1].lng },
		val: ko.observable(restaurants[x-1].val),
		select: ko.observable(restaurants.markSselected),
		map: map,
		animation: google.maps.Animation.BOUNCE
    });
    self.markArr.push(restMark);
    var len = self.markArr.length;
    self.markArr[len-1].setVisible(self.markArr[len-1].val());
  }
 
  //loads zomato API and gets rating,cuisines,rating_text and featured image from zomato by using restaurant id 
  self.loadZomato = function (restMark) {
	  var zomatourl="https://developers.zomato.com/api/v2.1/restaurant?res_id="+restMark.newid+"&apikey=5a5b7be958ea32cf3d0669727039f9af";
		  $.get(zomatourl, function(data, status){
			restMark.comments=data.user_rating.aggregate_rating;
			restMark.cuisines=data.cuisines;
			restMark.avgRating=data.user_rating.rating_text;
			restMark.im=data.featured_image;
        }).fail(function() {
			window.alert("Error!!!could not load zomato");
		});
  };

  //calls loadZomato for each marker and adds click selector to each
  for (z = 1; z <= self.markArr.length; z++) {
    (function (restMark) {
      self.loadZomato(restMark);
      restMark.addListener('click', function () {
        self.markerSel(restMark);
      });
    })(self.markArr[z-1]);
  }

  //this function getLoc searches for restaurants based on input given in input tag and filters all markers and list 
  self.getLoc = function () {
    markWindow.close();
    var searchResult = self.sResults();
    if (searchResult.length === 0) {
      self.showAllMark();
    } else {
      for (var i = 0; i < self.markArr.length; i++) {
		  var temp= self.markArr[i];
        if (temp.title.toLowerCase().indexOf(searchResult.toLowerCase()) >= 0) {
          temp.setVisible(true);
          temp.val(true);
		  temp.setAnimation(google.maps.Animation.BOUNCE);
		  
        } else {
          temp.setVisible(false);
          temp.val(false);
        }
      }
    }
    markWindow.close();
  };

  //shows all markers
  self.showAllMark = function () {
    for (var i = 0; i < self.markArr.length; i++) {
		self.markArr[i].setAnimation(google.maps.Animation.BOUNCE);
      self.markArr[i].setVisible(true);
      self.markArr[i].val(true);
    }
  };

  //hide all markers.
  self.hideMark = function () {
    for (var i = 0; i < self.markArr.length; i++) {
      self.markArr[i].select(false);
    }
  };

  //selects current marker.
  self.markerSel = function (restMark) {
    self.hideMark();
    restMark.select(true);
    self.current = restMark;
	
    //checks if cuisines extracted from zomato,if non empty then returns cuisines else returns error message
    finalCuisines = function () {
		var cui = self.current.cuisines;
      if (cui === "" || cui === undefined) {
        return "Sorry! Unable to connect!";
      }
      else {
        return "<b>Cuisines: </b>" + cui;
      }
    };
	//checks if images extracted from zomato,if non empty then returns cuisines else returns error message
	finalImage = function () {
		var ima = self.current.im;
      if (ima === "" || ima === undefined) {
        return "Sorry! Unable to connect!";
      }
      else {
        return '<div class="info-content"><img src="'+ ima +'"/></div><br>';
      }
    };
	//checks if comments extracted from zomato,if non empty then returns cuisines else returns error message
	finalComment = function () {
		var cm = self.current.comments;
      if (cm === "" || cm === undefined) {
        return "Sorry! Unable to connect!";
      }
      else {
        return "<b>Comment: </b>" + cm;
      }
    };
	//checks if average rating extracted from zomato,if non empty then returns cuisines else returns error message
	finalRating = function () {
		var ar = self.current.avgRating;
      if (ar === "" || ar === undefined) {
        return "Sorry! Unable to connect!";
      }
      else {
        return "<b>WRating: </b>" + ar;
      }
    };
    //combines image,title,cuisines,rating and comments and add them to markWindow which is displayed when marker or list is clicked
	
    var resinfo = finalImage()+"<br><b>Name: </b>" + self.current.title + "<br>" + finalCuisines() + "<br>"+finalRating()+"<br>"+finalComment();
    markWindow.setContent(resinfo);
    markWindow.open(map, restMark);

    //sets animation to null when marker or list is clicked
    self.anime = function (restMark) {
		restMark.setAnimation(null);
      //sets animation to bounce after 2800 ms or 4 seconds
      setTimeout(function () {
			restMark.setAnimation(google.maps.Animation.BOUNCE);
			
      }, 2800);
    };
    self.anime(restMark);
  };
};

