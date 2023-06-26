/*jshint strict:false, node:false */
/*exported run_tests, read_settings_from_cookie, beautify, submitIssue, copyText, selectAll, clearAll, changeToFileContent*/
/*
https://javascript-minifier.com/ 
*/
var the = {

    uploadedFiles: null, //SM:Added

    captcha: null, //SM:Added
    OrderList_LclJson: null,
    firstIndexItemId: 11,
	//shippingMethod: null,
};



function any(a, b) {
    return a || b;
}


function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = res => {
            resolve(res.target.result);
        };
        reader.onerror = err => reject(err);

        reader.readAsText(file);
    });
}


//SM: Below are the added functions************************



function locations(substring, string) {
    var a = [],
        i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
    return a;
}




function twoPairsMatch(pair1, pair2) {
    var fstvals = pair1.split(" ");
    var scndVals = pair2.split(" ");

    if ((fstvals[0].trim() == scndVals[0].trim()) && (fstvals[1].trim() == scndVals[1].trim())) {
        return true;
    } else {
        return false;
    }
}

function autocomplete(inp, arr) {
    //console.log("Autocomplete Start Time = " + new Date());
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp
        .addEventListener(
            "input",
            function(e) {
                //document.getElementById("SVDReviewDiv").style.display = "none";
                var a, b, i, val = this.value;
                var strPos;
                /*close any already open lists of autocompleted values*/
                closeAllLists();
                if (!val) {
                    return false;
                }

                //SM: DO NOT DELETE: options to 3 char
                //if (val.length < 3) {
                //	return false;
                //}

                currentFocus = -1;
                /*create a DIV element that will contain the items (values):*/
                a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");
                /*append the DIV element as a child of the autocomplete container:*/
                this.parentNode.appendChild(a);
                /*for each item in the array...*/
                for (i = 0; i < arr.length; i++) {
                    /*check if the item starts with the same letters as the text field value:*/

                    //if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    strPos = arr[i].toUpperCase().indexOf(
                        val.toUpperCase());

                    //SM: DO NOT DELETE: options to 50

                    //if (a.childElementCount > 50) {
                    //	break;
                    //}

                    if (strPos > -1) {

                        /*create a DIV element for each matching element:*/
                        b = document.createElement("DIV");
                        /*make the matching letters bold:*/

                        b.innerHTML = arr[i].substr(0, strPos);
                        b.innerHTML += "<strong>" +
                            arr[i].substr(strPos, val.length) +
                            "</strong>";
                        b.innerHTML += arr[i].substr(strPos +
                            val.length);

                        /*insert a input field that will hold the current array item's value:*/
                        b.innerHTML += "<input type='hidden' value='" +
                            arr[i] + "'>";
                        /*execute a function when someone clicks on the item value (DIV element):*/
                        b
                            .addEventListener(
                                "click",
                                function(e) {
                                    /*insert the value for the autocomplete text field:*/
                                    inp.value = this
                                        .getElementsByTagName("input")[0].value;
                                    /*close the list of autocompleted values,
                                    (or any other open lists of autocompleted values:*/
                                    closeAllLists();

                                    populateSubCategory();
                                });
                        a.appendChild(b);
                    }
                }
            });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x)
            x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x)
            return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");

        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });

    //console.log("Autocomplete End Time = " + new Date());
}

function showMyOrders() {

    tags = JSON.parse(localStorage.getItem("orderList"));

    /*
    if (tags != null) {
        if (tags != "") {
            populateOrders();
            return;
        }
    }
	*/

    var customeremail = sessionStorage.getItem("userEmail");
    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getOrderList",
            customeremail: customeremail
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {

            localStorage.setItem("orderList", JSON.stringify(response));

            populateOrders();



        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}

function showMdaOrders() {

    if (sessionStorage.getItem("userLoggedIn") == "n") {
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        return;
    }
    tags = JSON.parse(localStorage.getItem("mdaOrderList"));

    /*
    if (tags != null) {
        if (tags != "") {
            populateMdaOrders();
            return;
        }
    }
	*/

    var customeremail = sessionStorage.getItem("userEmail");
    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getMdaOrderList",
            customeremail: customeremail
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {

            localStorage.setItem("mdaOrderList", JSON.stringify(response));
			getMdaItems();
            populateMdaOrders();



        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}

function showMdaItems() {

    if (sessionStorage.getItem("userLoggedIn") == "n") {
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        return;
    }
    //var tags = the.itemList_LclJson;
    tags = JSON.parse(localStorage.getItem("mdaItemList"));

    /*
    if (tags != null) {
        if (tags != "") {
			populateMdaItemList();
            return;
        }
    }
	*/

    var customeremail = sessionStorage.getItem("userEmail");
    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getMdaItemsList",
            customeremail: customeremail
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;
            localStorage.setItem("mdaItemList", JSON.stringify(response));

            populateMdaItemList();

        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}

function getMdaItems() {

    if (sessionStorage.getItem("userLoggedIn") == "n") {
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        return;
    }
    //var tags = the.itemList_LclJson;
    tags = JSON.parse(localStorage.getItem("mdaItemList"));

    /*
    if (tags != null) {
        if (tags != "") {
			populateMdaItemList();
            return;
        }
    }
	*/

    var customeremail = sessionStorage.getItem("userEmail");
    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getMdaItemsList",
            customeremail: customeremail
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;
            localStorage.setItem("mdaItemList", JSON.stringify(response));

            //populateMdaItemList();

        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}

//function showImage(event, itemid, imageelementid){
function showImage(event) {
    //const [file] = file.files

    /*
    const file = document.getElementById("upldimgid").files;
    if (file) {
      blah.src = URL.createObjectURL(file)
    }	
    */
    //var itemid = this.dataset.itemid;
    var elem = event.target;
    var itemid = elem.dataset.itemid;
    var imageelementid = elem.dataset.imageelementid;

    var output = document.getElementById(imageelementid + itemid);
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }

}

function showArtImage(event) {

    var elem = event.target;
    var imageid = elem.dataset.imageid;
    var imageelementid = elem.dataset.imageelementid;

    var output = document.getElementById(imageelementid + imageid);
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }

}

// Upload file
//function uploadFile(itemid, fileelementid, saveasnameelementid, errormsgelementid) {
function uploadFile(event) {
    if (sessionStorage.getItem("userLoggedIn") == "n") {

        error_message = "Not authorized";
        //document.getElementById("updateordererrormsg-"+orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        error_message = "Not authorized";
        //document.getElementById("updateordererrormsg-"+orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }
    var elem = event.target;
    var fileelementid = elem.dataset.fileelementid;
    var saveasnameelementid = elem.dataset.saveasnameelementid;
    var itemid = elem.dataset.itemid;

    var saveasname = document.getElementById(saveasnameelementid + itemid).value;
    saveasname = saveasname.trim();
    saveasname = saveasname.toLowerCase();

    if (saveasnameelementid == 'image-') {
        if (elem.dataset.facing == "front") {
            saveasname = saveasname + "_front.png";
        } else {
            saveasname = saveasname + "_back.png";
        }
    }

    var errormsgelementid = elem.dataset.errormsgelementid;



    //var saveasname = document.getElementById(saveasnameelementid + itemid).value;
    saveasname = saveasname.trim();
    saveasname = saveasname.toLowerCase();

    if (!saveasname.includes(".png")) {
        saveasname = saveasname + ".png";
    }

    var files = document.getElementById(fileelementid + itemid).files;

    if (files.length > 0) {

        var formData = new FormData();
        formData.append("file", files[0]);
        formData.append("saveasname", saveasname);
        formData.append("dir", "img");

        var xhttp = new XMLHttpRequest();

        // Set POST method and ajax file path
        xhttp.open("POST", "/goodsandgift/php/upload.php", true);

        // call on request changes state
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                var response = this.responseText;
                //console.log(response);

                document.getElementById(errormsgelementid + itemid).innerHTML = "<font color = #0000>" + response + "</font> ";
                /*
           if(response == 1){
              alert("Upload successfully.");
           }else{
              alert("File not uploaded.");
           }
		   */
            }
        };

        // Send request with data
        xhttp.send(formData);

    } else {
        alert("Please select a file");
    }

}

function uploadArtFile(event) {
    if (sessionStorage.getItem("userLoggedIn") == "n") {

        error_message = "Not authorized";
        //document.getElementById("updateordererrormsg-"+orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        error_message = "Not authorized";
        //document.getElementById("updateordererrormsg-"+orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }
    var elem = event.target;
    var fileelementid = elem.dataset.fileelementid;
    var saveasnameelementid = elem.dataset.saveasnameelementid;
    var imageid = elem.dataset.imageid;

    var saveasname = document.getElementById(saveasnameelementid + imageid).value;
    saveasname = saveasname.trim();
    saveasname = saveasname.toLowerCase();



    var errormsgelementid = elem.dataset.errormsgelementid;



    //var saveasname = document.getElementById(saveasnameelementid + itemid).value;
    saveasname = saveasname.trim();
    saveasname = saveasname.toLowerCase();

    if (!saveasname.includes(".png")) {
        saveasname = saveasname + ".png";
    }

    var files = document.getElementById(fileelementid + imageid).files;

    if (files.length > 0) {

        var formData = new FormData();
        formData.append("file", files[0]);
        formData.append("saveasname", saveasname);
        formData.append("dir", "imgart");

        var xhttp = new XMLHttpRequest();

        // Set POST method and ajax file path
        xhttp.open("POST", "/goodsandgift/php/upload.php", true);

        // call on request changes state
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                var response = this.responseText;
                //console.log(response);

                document.getElementById(errormsgelementid + imageid).innerHTML = "<font color = #0000>" + response + "</font> ";
                /*
           if(response == 1){
              alert("Upload successfully.");
           }else{
              alert("File not uploaded.");
           }
		   */
            }
        };

        // Send request with data
        xhttp.send(formData);

    } else {
        //alert("Please select a file");
    }

}

function getItemList() {
    //var tags = the.itemList_LclJson;
    tags = JSON.parse(localStorage.getItem("itemList"));

    /*
    if (tags != null) {
        if (tags != "") {
            return;
        }
    }
	*/

    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getItemsList"
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;

            var tags = JSON.parse(response);
            the.firstIndexItemId = tags[0].itemid;
            localStorage.setItem("itemList", JSON.stringify(response));
            getMaxCounts();
            //populateItemListInDropDown();

        },
        error: function(xhr, status, error) {
            //console.log(error);
            //console.log(xhr);
        }
    });
}

function getMaxCounts() {
    //var tags = the.itemList_LclJson;
    var tags = JSON.parse(sessionStorage.getItem("max-count-Key^Chain"));

    
    if (tags != null) {
        if (tags != "") {
            return;
        }
    }
	

    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getMaxCounts"
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;

            tags = JSON.parse(response);
 
            var rows = tags;
            var categoryCount = 0;
			var defaultDisplayCount = 2;
            for (var i = 0; i < rows.length; i++) {
                sessionStorage.setItem("max-count-" + rows[i].category.replaceAll(' ', '^'), rows[i].count)
				sessionStorage.setItem("display-count-" + rows[i].category.replaceAll(' ', '^'), defaultDisplayCount)
            }

            //populateItemListInDropDown();

        },
        error: function(xhr, status, error) {
            console.log(error);
            //console.log(xhr);
        }
    });
}

function getArtList() {
    //var tags = the.itemList_LclJson;
    tags = JSON.parse(localStorage.getItem("artList"));


    if (tags != null) {
        if (tags != "") {
            return;
        }
    }


    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getArtList"
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;
            localStorage.setItem("artList", JSON.stringify(response));

            //populateItemListInDropDown();

        },
        error: function(xhr, status, error) {
            //console.log(error);
            //console.log(xhr);
        }
    });
}

function getMdaArtList() {



    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getArtList"
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            //the.itemList_LclJson = response;
            localStorage.setItem("artList", JSON.stringify(response));
            showMdaArts();
            //populateItemListInDropDown();

        },
        error: function(xhr, status, error) {
            //console.log(error);
            //console.log(xhr);
        }
    });
}

function populateOrders() {
    var xyz = JSON.parse(localStorage.getItem("orderList"));
    var cartArray = JSON.parse(xyz);

    if (cartArray == "E") {
        alert("No orders found");
        return;
    }

    var output = "";
	var orderTotal = 0;
	var itemSubTotal = 0;
	var shippingCost = 0;
	
	var delMethod = "";
	var orderDeliveryAddress = "";
	var orderDeliveryMethod = "";
	var orderNumber = "";
	var orderDate = "";
	var deliveryaddress = "";
	
    for (var i = 0; i < cartArray.length; i++) {
		
		orderTotal = cartArray[i].ordertotalbill;
		delMethod = cartArray[i].deliverymethod;
		orderNumber = cartArray[i].orderid;
		orderDate = cartArray[i].orderdate.substring(0, 10);
		deliveryaddress = cartArray[i].deliveryaddress;
		
		if (cartArray[i].deliverymethod != "pick up"){	
			  var Arr = delMethod.split("CAD ");
			  shippingCost = Number(Arr[1]);
			  itemSubTotal = orderTotal - shippingCost;
			  orderDeliveryAddress = "Shipping Address: <br>"+ deliveryaddress;
			  orderDeliveryMethod = "Ship to address" ;
		}else {
			  orderDeliveryAddress = "Pick Up Address: <br>"+"825 Indica Street, Stittsville, ON, K2S2J8";
			  orderDeliveryMethod = "Pick Up" ;
		}
		
        if (i == 0) {
			//Start of first order head
            output += "<div class='orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";
			
			 if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			output += ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' style= 'text-align: center;' id='table-" + cartArray[i].orderid + "'><div style='background-color:#f8f8f8; padding: 5px; margin: 10px;'><h5>Items Ordered</h5>";
        } else if (cartArray[i].orderid != cartArray[i - 1].orderid) {
			//End of previous order and Start of next order head

			orderTotal = cartArray[i-1].ordertotalbill;
			delMethod = cartArray[i-1].deliverymethod;
			orderNumber = cartArray[i-1].orderid;
			orderDate = cartArray[i-1].orderdate.substring(0, 10);
			deliveryaddress = cartArray[i-1].deliveryaddress;
			
			if (cartArray[i-1].deliverymethod != "pick up"){	
				  var Arr = delMethod.split("CAD ");
				  shippingCost = Number(Arr[1]);
				  itemSubTotal = orderTotal - shippingCost;
				  orderDeliveryAddress = "Shipping Address: <br>"+ deliveryaddress;
				  orderDeliveryMethod = "Ship to address" ;
			}else {
				  orderDeliveryAddress = "Pick Up Address: <br>"+"825 Indica Street, Stittsville, ON, K2S2J8";
				  orderDeliveryMethod = "Pick Up" ;
			}
		
			if (cartArray[i-1].deliverymethod == "pick up"){
				output += "<div class='orderTotals' style='padding: 10px 0px 10px 0px; background-color: #4E9CAF; color: #fff'>  Order Total:	CAD "+ orderTotal +"<br>  </div>" ;
			} else {
				output += "<div class='orderTotals' style='padding: 10px 0px 10px 0px; background-color: #4E9CAF; color: #fff'>  Subtotal:	CAD "+itemSubTotal+" <br>  Shipping: CAD "+shippingCost+"   <br>  Order Total:	CAD "+orderTotal+"<br>  </div>" ;
			}
			
			output += "</div><div style='background-color: #eeeeee; padding: 5px; margin: 10px;'><h5>Order & delivery info  </h5><div class='myOrderFlexOuter' style='display: flex; margin: 20px;  border-radius: 10px; border: 1px solid #ccc;  '>";
			
			output += "<div class='myOrderFlexIn orderNbr' style=' padding: 20px 0px 20px 0px;'>Order#"+orderNumber+" <br>Contact Email: "+ cartArray[i-1].customeremail + "<br>Delivery Method:"+orderDeliveryMethod+"<br>Order date: "+orderDate+" </div>";
			
			output += "<div class='myOrderFlexIn shipping' style=' padding: 20px 0px 20px 0px;'>"+orderDeliveryAddress+"</div></div></div></div>";
			
			

			
            output += "<div class='orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";

			 if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			
			output += ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse'  style= 'text-align: center;' id='table-" + cartArray[i].orderid + "'><div style='background-color:#f8f8f8; padding: 5px; margin: 10px;'><h5>Items Ordered</h5>";
        }

		//Order Item Row
        
		output += "<div class='myOrderFlexOuter' style='display: flex; margin: 20px;  border-radius: 10px; border: 1px solid #ccc; '><div class='myOrderFlexIn' >";
        if (cartArray[i].customItemCanvasDataFront != null) {
            if (cartArray[i].customItemCanvasDataFront != "") {
                output += "<div style='height: 200px; width:200px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_front.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataFront + "'/></div>";
            }
        }		

        if (cartArray[i].customItemCanvasDataBack != null) {
            if (cartArray[i].customItemCanvasDataBack != "") {
                output += "<div style='height: 200px; width:200px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_back.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataBack + "'/></div>";
            }
        }
		output += "</div>";
		output += "<div class='myOrderFlexIn itemNamePriceQnty' style='margin: auto; padding: 10px;'>Keychain<br>Item Price: CAD "+cartArray[i].itemprice+"<br>Qty: "+cartArray[i].itemquantity;
		
        if (cartArray[i].itemnotes != "") {
            output += "<br>Note:" + cartArray[i].itemnotes  ;
        }		
		
		output += "</div></div>";
				
		
		
        if (i == cartArray.length - 1) {
		//End of last order
			if (cartArray[i].deliverymethod == "pick up"){
				output += "<div class='orderTotals' style='padding: 10px 0px 10px 0px; background-color: #4E9CAF; color: #fff'>  Order Total:	CAD "+ orderTotal +"<br>  </div>" ;
			} else {
				output += "<div class='orderTotals' style='padding: 10px 0px 10px 0px; background-color: #4E9CAF; color: #fff'>  Subtotal:	CAD "+itemSubTotal+" <br>  Shipping: CAD "+shippingCost+"   <br>  Order Total:	CAD "+orderTotal+"<br>  </div>" ;
			}
			
			output += "</div><div style='background-color: #eeeeee; padding: 5px; margin: 10px;'><h6>Order & delivery info  </h6><div class='myOrderFlexOuter' style='display: flex; margin: 20px;  border-radius: 10px; border: 1px solid #ccc;  '>";
			
			output += "<div class='myOrderFlexIn orderNbr' style=' padding: 20px 0px 20px 0px;'>Order#"+orderNumber+" <br>Contact Email: "+ cartArray[i].customeremail + "<br>Delivery Method:"+orderDeliveryMethod+"<br>Order date: "+orderDate+" </div>";
			
			output += "<div class='myOrderFlexIn shipping' style=' padding: 20px 0px 20px 0px;'>"+orderDeliveryAddress+"</div></div></div></div>";
		
			
        }

    }

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";

    document.getElementById("showOrdersDivId").innerHTML = output;
    document.getElementById("showOrdersDivId").style.display = "block";
}


function populateOrders_backup() {
    var xyz = JSON.parse(localStorage.getItem("orderList"));
    var cartArray = JSON.parse(xyz);

    if (cartArray == "E") {
        alert("No orders found");
        return;
    }

    var output = "";

    for (var i = 0; i < cartArray.length; i++) {
        if (i == 0) {
			//Start of first order head
            output += "<div class='orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";
			
			 if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			output += ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' id='table-" + cartArray[i].orderid + "'><table class='table'>";
        } else if (cartArray[i].orderid != cartArray[i - 1].orderid) {
			//End of previous order and Start of next order head
			
				output += "</table> <div class='addressOnMyOrders'>Customer Contact Email: " + cartArray[i].customeremail ;
            
			if (cartArray[i-1].deliverymethod == "pick up"){			
				output +=	"<br><br>Pickup Address: 825 Indica Street, Stittsville, ON</div></div>";
			}else {
				output +=	"<br><br>Shipping Address: <br>" + cartArray[i-1].deliveryaddress + "</div></div>";
			}
			
            output += "<div class='orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";

			 if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			
			output += ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' id='table-" + cartArray[i].orderid + "'><table class='table'>";
        }

		//Order Item Row
        output += "<tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
            "<td style='position: relative; padding-top:60px'><div id='itemHdrDiv' style='display:flex; flex-direction: row;'>";

        output += cartArray[i].itemname +
            " (Unit price = CAD " + cartArray[i].itemprice + ") </div>"

        if (cartArray[i].itemnotes != "") {
            output += "<div>Note:" + cartArray[i].itemnotes + "</div>";
        }
        if (cartArray[i].customItemCanvasDataFront != null) {
            if (cartArray[i].customItemCanvasDataFront != "") {
                output += "<div style='height: 200px; width:200px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_front.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataFront + "'/></div>";
            }
        }

        if (cartArray[i].customItemCanvasDataBack != null) {
            if (cartArray[i].customItemCanvasDataBack != "") {
                output += "<div style='height: 200px; width:200px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_back.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataBack + "'/></div>";
            }
        }

        output += "Quanitity: " + cartArray[i].itemquantity + "</td>" +
            "</tr>";
		
        if (i == cartArray.length - 1) {
		//End of last order
			output += "</table> <div class='addressOnMyOrders'>Customer Contact Email: " + cartArray[i].customeremail ;
            
			if (cartArray[i].deliverymethod == "pick up"){			
				output +=	"<br><br>Pickup Address: 825 Indica Street, Stittsville, ON</div></div>";
			}else {
				output +=	"<br><br>Shipping Address: <br>" + (cartArray[i].deliveryaddress) + "</div></div>";
			}			
			
        }

    }

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";

    document.getElementById("showOrdersDivId").innerHTML = output;
    document.getElementById("showOrdersDivId").style.display = "block";
}


function populateMdaOrders() {
    var xyz = JSON.parse(localStorage.getItem("mdaOrderList"));
    var cartArray = JSON.parse(xyz);

    var output = "";

    for (var i = 0; i < cartArray.length; i++) {
        if (i == 0) {
            output += "<div class='" + cartArray[i].orderstatus + "-order orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Customer Email: " + cartArray[i].customeremail + "<br> Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";
			
			if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			 
			output +=  ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' id='table-" + cartArray[i].orderid + "'><table class='table'>";
        } else if (cartArray[i].orderid != cartArray[i - 1].orderid) {
            //output += "</table> <div class='addressOnMyOrders'>Pickup Address: 825 Indica Street, Stittsville, ON</div></div>";
            output += "</table><div class='addressOnMyOrders'>"

                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Customer Information</div>" +
                "Customer Name: <br>" +
                "<input type='text'  id='customername-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[i - 1].customername + "'>" +
                "<br>Customer Email: <br>" +
                "<input type='text' id='customeremail-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[i - 1].customeremail + "'>" +
                "</div>"

                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Order Amount and Payment</div>" +
                "Order Amount (CAD): <br>" +
                "<input type='text' id='ordertotalbill-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[i - 1].ordertotalbill + "'>"

                +
                "<br><br>Payment Amount Received:(Decimal Amount e.g. 10.00) <br>" +
                "<input type='text' id='paymentamountreceived-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[i - 1].paymentamountreceived + "'>"

                +
                "<br><br>Payment Method Used: <br>" +
                "<input type='text' id='paymentmethod-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[i - 1].paymentmethod + "'>"

                +

                "<br><br>Payment Id: <br>" +
                "<input type='text' id='paymentid-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[i - 1].paymentid + "'>" +



				
                "<br><br>Payment Date:(yyyy-mm-dd) <br>" +
                "<input type='text' id='paymentdate-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[i - 1].paymentdate + "'>" +
                "</div>"


                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Shipping/Pick Up</div>" +
                "Shipping Method: <br>" +
                "<input type='text' id='deliverymethod-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[i - 1].deliverymethod + "'>"

                +
                "<br><br>Shipping Address: (Add tracking if available -with line break characters before and after Tracking:-, at the bottom when item is shipped. This will be emailed in the status update email.)<br>" +
				
			
                "<textarea class='span2 fullWidth' id='deliveryaddress-" + cartArray[i - 1].orderid + "' style='width:95%; ' rows='4' cols='8'>" + cartArray[i - 1].deliveryaddress + "</textarea><br>" 
                +
                "</div>"



                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Order Status</div>"

                +
                "<div style='border:1px solid #333; border-radius: 5px; width:95%; padding: 5px; font-size: 12px; text-align: justify; text-justify: inter-word; background-color: #ecf1f1' >When payment is received mark the order status as Open. <br><br>When the item is ready to be picked up, or order is shipped (Add tracking details if available, at the bottom of shipping address above), change the status to Ready To Pick Up or Order Shipped and click on send email button. This action will send email to the user in addition to saving the changes.<br><br>When the item is picked up, mark the order status as Closed.</div>" +
                "<br>Order Status:(Received/Open/Ready To Pick Up/Order Shipped/Cancelled/Closed)<br>" +
                "<input type='text' id='orderstatus-" + cartArray[i - 1].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[i - 1].orderstatus + "'>"

                +
                "<br><br>Order Status Update Note: <br>" +
                "<textarea class='span2 fullWidth' id='orderstatusupdatenotes-" + cartArray[i - 1].orderid + "' style='width:95%; ' rows='4' cols='8'>" + cartArray[i - 1].orderstatusupdatenotes + "</textarea><br>" +
                "</div>"



                +
                "<label id='updateordererrormsg-" + cartArray[i - 1].orderid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

                +
                "<div class = 'saveChangesDivCls'><button  type='button' class='btn btn-primary' onclick=updateOrder('" + cartArray[i - 1].orderid + "','n') >Save</button>" +
                "<button   type='button' class='btn btn-primary' onclick=updateOrder('" + cartArray[i - 1].orderid + "','y') >Save & Send Email</button></div>" +
                "<br></div></div>";

            output += "<div class='" + cartArray[i].orderstatus + "-order orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + cartArray[i].orderid + "'>  Customer Email: " + cartArray[i].customeremail + "<br> Order Id: " + cartArray[i].orderid + "<br>Order Date: " + cartArray[i].orderdate.substring(0, 10) + "<br>Order Total ";

			if (cartArray[i].deliverymethod != "pick up"){			
				output += "(Includes shipping)";
			 }
			 
			output += ": $" + cartArray[i].ordertotalbill + "<br>Order Status: " + cartArray[i].orderstatus + "<br>Message: " + cartArray[i].ordercheckoutnotes + "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' id='table-" + cartArray[i].orderid + "'><table class='table'>";
        }

        output += "<tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
            "<td style='position: relative; padding-top:60px'><div id='itemHdrDiv' style='display:flex; flex-direction: row;'>";

        output += cartArray[i].itemname +
            " (Unit price = CAD " + cartArray[i].itemprice + ") </div>"

        if (cartArray[i].itemnotes != "") {
            output += "<div>" + cartArray[i].questionforaddnote + "<br>Note:" + cartArray[i].itemnotes + "</div>";
        }
        if (cartArray[i].customItemCanvasDataFront != null) {
            if (cartArray[i].customItemCanvasDataFront != "") {
                output += "<div style='height: 400px; width:400px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_front.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataFront + "'/></div>";
                output += "Image link: (For better quality image, click load on canvas below and then click on PRINT button) <a href='orderimages/" + cartArray[i].customItemCanvasDataFront + "' download>Download</a> <br> ";
            }
        }

        if (cartArray[i].customItemCanvasDataBack != null) {
            if (cartArray[i].customItemCanvasDataBack != "") {
                output += "<div style='height: 400px; width:400px; background-color: " + cartArray[i].itemcolor + "; background-size: cover; background-repeat: no-repeat;  background-image:url(" + '"/goodsandgift/img/' + cartArray[i].itemimage + '_back.png"' + ") '><img style='margin-left: 0px; ' src='/goodsandgift/orderimages/" + cartArray[i].customItemCanvasDataBack + "'/></div>";
                output += "Image link: (For better quality image, click load on canvas below and then click on PRINT button) <a href='orderimages/" + cartArray[i].customItemCanvasDataBack + "' download>Download</a> <br> ";
            }
        }



        output += "Quanitity: " + cartArray[i].itemquantity + "<br>";

        //SM: Do not delete below: May be needed if templates are locked for modification in future*********
        /*
        var xyz = JSON.parse(localStorage.getItem("itemList"));
        var itemArray = JSON.parse(xyz);
        for (var t = 0; t < itemArray.length; t++) {
        	if (itemArray[t].itemid == cartArray[i].itemid) {
        		
        		if(itemArray[t].canvasfrontstring != ''){
        			output += "<br><input type='button' value='Load Item on Canvas' data-canvasfrontstring='"+ itemArray[t].canvasfrontstring +"'  data-canvasbackstring = '"+ itemArray[t].canvasbackstring +"'   data-itemcolor='"+ cartArray[i].itemcolor+"'  data-itemid='"+ itemArray[t].itemid +"' data-imgsrc='item' onclick='loadTemplateItemOnCanvas(event);'  > <br>";
        			break;
        		}else {
        			output += "<br><input type='button' value='Load Order on Canvas' data-canvasfrontstring='"+ cartArray[i].canvasfrontstring +"'  data-canvasbackstring = '"+ cartArray[i].canvasbackstring +"'   data-itemcolor='"+ cartArray[i].itemcolor+"'  data-itemid='"+ itemArray[t].itemid +"' data-imgsrc='order' onclick='loadTemplateItemOnCanvas(event);'  > <br>";
        		}
        		
        	}
        }
        */

        output += "<br><input type='button' value='Load Order on Canvas' data-canvasfrontstring='" + cartArray[i].canvasfrontstring + "'  data-canvasbackstring = '" + cartArray[i].canvasbackstring + "'   data-itemcolor='" + cartArray[i].itemcolor + "'  data-itemid='" + cartArray[i].itemid + "' data-imgsrc='order' onclick='loadTemplateItemOnCanvas(event);'  > <br>";

        output += "</td>" +
            "</tr>";

        if (i == cartArray.length - 1) {
            output += "</table><div class='addressOnMyOrders'>" +                
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Customer Information</div>" +
                "Customer Name: <br>" +
                "<input type='text'  id='customername-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[ i].customername + "'>" +
                "<br>Customer Email: <br>" +
                "<input type='text' id='customeremail-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[ i].customeremail + "'>" +
                "</div>"

                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Order Amount and Payment</div>" +
                "Order Amount (CAD): <br>" +
                "<input type='text' id='ordertotalbill-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[ i].ordertotalbill + "'>"

                +
                "<br><br>Payment Amount Received:(Decimal Amount e.g. 10.00) <br>" +
                "<input type='text' id='paymentamountreceived-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[ i].paymentamountreceived + "'>"

                +
                "<br><br>Payment Method Used: <br>" +
                "<input type='text' id='paymentmethod-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[ i].paymentmethod + "'>"

                +

                "<br><br>Payment Id: <br>" +
                "<input type='text' id='paymentid-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[ i].paymentid + "'>" +



				
                "<br><br>Payment Date:(yyyy-mm-dd) <br>" +
                "<input type='text' id='paymentdate-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[ i].paymentdate + "'>" +
                "</div>"


                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Shipping/Pick Up</div>" +
                "Shipping Method: <br>" +
                "<input type='text' id='deliverymethod-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' readonly value='" + cartArray[ i].deliverymethod + "'>"

                +
                "<br><br>Shipping Address: (Add tracking if available -with line break characters before and after Tracking:-, at the bottom when item is shipped. This will be emailed in the status update email.)<br>" +
				
			
                "<textarea class='span2 fullWidth' id='deliveryaddress-" + cartArray[ i].orderid + "' style='width:95%; ' rows='4' cols='8'>" + cartArray[ i].deliveryaddress + "</textarea><br>" 
                +
                "</div>"



                +
                "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Order Status</div>"

                +
                "<div style='border:1px solid #333; border-radius: 5px; width:95%; padding: 5px; font-size: 12px; text-align: justify; text-justify: inter-word; background-color: #ecf1f1' >When payment is received mark the order status as Open. <br><br>When the item is ready to be picked up, or order is shipped (Add tracking details if available, at the bottom of shipping address above), change the status to Ready To Pick Up or Order Shipped and click on send email button. This action will send email to the user in addition to saving the changes.<br><br>When the item is picked up, mark the order status as Closed.</div>" +
                "<br>Order Status:(Received/Open/Ready To Pick Up/Order Shipped/Cancelled/Closed)<br>" +
                "<input type='text' id='orderstatus-" + cartArray[ i].orderid + "' style='width:95%; margin:auto;' value='" + cartArray[ i].orderstatus + "'>"

                +
                "<br><br>Order Status Update Note: <br>" +
                "<textarea class='span2 fullWidth' id='orderstatusupdatenotes-" + cartArray[ i].orderid + "' style='width:95%; ' rows='4' cols='8'>" + cartArray[ i].orderstatusupdatenotes + "</textarea><br>" +
                "</div>"



                +
                "<label id='updateordererrormsg-" + cartArray[ i].orderid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

                +
                "<div class = 'saveChangesDivCls'><button  type='button' class='btn btn-primary' onclick=updateOrder('" + cartArray[ i].orderid + "','n') >Save</button>" +
                "<button   type='button' class='btn btn-primary' onclick=updateOrder('" + cartArray[ i].orderid + "','y') >Save & Send Email</button></div>" +
                "<br></div></div>";
        }

    }

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";

    document.getElementById("showOrdersDivId").innerHTML = output;
    document.getElementById("showOrdersDivId").style.display = "block";
}


function populateMdaItemList() {
    var xyz = JSON.parse(localStorage.getItem("mdaItemList"));
    var itemArray = JSON.parse(xyz);

    var output = "";
    var params = "";
    output = "<button  style='float: right' type='button' class='btn btn-primary' onclick=updateItem('','y') >Add New Item</button>";

    for (var i = 0; i < itemArray.length; i++) {

        output += "<div class=' currentlyoffereditem-" + itemArray[i].currentlyoffered + " orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + itemArray[i].itemid + "' style='padding-bottom: 30px;'>  Name: " + itemArray[i].itemname + "<br> Category: " + itemArray[i].category + "<br>price: $" + itemArray[i].price;

        output += "<div style='height: 200px; width:200px; border-radius:5px; background-size: cover; background-repeat: no-repeat; background-color:#fff;  background-image:url(" + '"/goodsandgift/img/' + itemArray[i].thumbnailimage + '"' + ") '></div>";

        output += "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> <div class='collapse' id='table-" + itemArray[i].itemid + "'><table class='table'>";




        output += "<tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
            "<td style='position: relative; padding-top:60px'>"



        output += "</td>" +
            "</tr>";


        output += "</table><div class='addressOnMyOrders'>"

            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Name and Description</div>" +
            "Name: <br>"

            +
            "<input type='text'  id='itemname-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].itemname + "'>" +
            "<br><br>Item Description: <br>(This will be displayed on the product page)<br>" +
            "<textarea class='span2 fullWidth' id='itemdesc-" + itemArray[i].itemid + "' style='width:95%; ' rows='4' cols='8'>" + itemArray[i].itemdesc + "</textarea>"

            +
            "<br><br>Item Short Description: <br>(This will be displayed on image flip)<br>" +
            "<textarea class='span2 fullWidth' id='itemshortdesc-" + itemArray[i].itemid + "' style='width:95%; ' rows='4' cols='8'>" + itemArray[i].itemshortdesc + "</textarea>"

            +
            "<br><br>Master Item Id: <br>(Will be used to manage inventory-Usually item id of first item created of that product type)<br>" +
            "<input type='text' id='masteritemid-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].masteritemid + "'>"

            +
            "<br><br>Item Sort Order Id: <br>(Used to order the item display in a category)<br>" +
            "<input type='text' id='itemsortorderid-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].itemsortorderid + "'>"

            +
            "<br><br>Category Sort Order Id: <br>(Used to order the category display. All items under a category will have same category sort order id)<br>" +
            "<input type='text' id='categorysortorderid-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].categorysortorderid + "'>"

            +
            "<br><br>Vinyl Type: <br>(Select from Permanent/HTV/Removable :Used to display color options)<br>" +
            "<input type='text' id='vinyltype-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].vinyltype + "'>"
			
            +
            "</div>"

            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Availability and Pricing</div>" +
            "Available for purchase: (1 for yes, 0 for no) <br>" +
            "<input type='text' id='currentlyoffered-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].currentlyoffered + "'>" +
            
			"<br><br>Price: (Decimal. E.g. 30.0) <br>" +
            "<input type='text' id='price-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].price + "'>" +
            
			"<br><br>Shipping-Bubble Mailer: (Decimal. E.g. 8.0) <br>" +
            "<input type='text' id='shipbubble-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].shipbubble + "'>" +
			
			"<br><br>Shipping-Regular: (Decimal. E.g. 8.0) <br>" +
            "<input type='text' id='shipreg-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].shipreg + "'>" +

			"<br><br>Shipping-Expedited: (Decimal. E.g. 8.0) <br>" +
            "<input type='text' id='shipexped-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].shipexped + "'>" +

			"<br><br>Shipping-Priority: (Decimal. E.g. 8.0) <br>" +
            "<input type='text' id='shippriority-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].shippriority + "'>" +

			"<br><br>Shipping Weight (Max of actual weight and volumetric weight in Kg. https://www.canadapost-postescanada.ca/cpc/doc/en/support/customer-guide/amalgamated-parcel-services-guide.pdf): (Decimal. E.g. 8.0) <br>" +
            "<input type='text' id='shipweightkg-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].shipweightkg + "'>" +

			
			"</div>"


            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Classification and search keywords</div>" +
            "Category: <br>" +
            "<input type='text' id='category-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].category + "'>" +
            "<br><br>Subcategory: <br>" +
            "<input type='text' id='subcategory-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].subcategory + "'>" +
            "<br><br>Search Keywords: <br>(In addition to item name, category, sub category)<br>" +
            "<input type='text' id='keyword-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].keyword + "'>" +
            "</div>";



        // thumbnailimage update

        output += "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Thumbnail and Display Images</div>"

            +
            "Thumbnail Image:(e.g. myimage.png)" +
            "<input type='text' id='thumbnailimage-" + itemArray[i].itemid + "' style='width:95%; margin:auto;'  value='" + itemArray[i].thumbnailimage + "'>"

            +
            "<br><img id='thumbnailimage-src-replace-" + itemArray[i].itemid + "' src='/goodsandgift/img/" + itemArray[i].thumbnailimage + "' style='width: 200px; height: 200px; background-color: white;' alt='Image not available' />"

            +
            "<br><input type='file'  id='thumbnailimage-replace-" + itemArray[i].itemid + "' data-itemid = '" + itemArray[i].itemid + "'   data-imageelementid='thumbnailimage-src-replace-' onchange='showImage(event)'>"

            +
            "<br><label id='thumbnailimage-ererrormsg-" + itemArray[i].itemid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<br><input type='button' value='Upload New Image' data-errormsgelementid='thumbnailimage-ererrormsg-' data-saveasnameelementid='thumbnailimage-' data-fileelementid='thumbnailimage-replace-' data-itemid = '" + itemArray[i].itemid + "' onclick='uploadFile(event);'  >";



        // item front and back image update

        output += "<br><br>Are there two images for the item:(type 1 for yes, or 0 for no) <br>"

            +
            "<input type='text' id='hasmultipleimages-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].hasmultipleimages + "'>"

            +
            "<br><br>Image Name: (Without _front.png/_back.png) <br>" +
            "<input type='text' id='image-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].image + "'>" +
            "<br><br> Front Image:(Image should be about square size min 600px X 600px)"
            //Front Image

            +
            "<br><img  id='itemfrontimage-src-replace-" + itemArray[i].itemid + "' src='/goodsandgift/img/" + itemArray[i].image + "_front.png' style='width: 200px; height: 200px; background-color: white;' alt='Image not available' />" +
            "<br>Replace Front Image:" +
            "<br><input type='file'  id='itemfrontimage-replace-" + itemArray[i].itemid + "' data-itemid = '" + itemArray[i].itemid + "'   data-imageelementid='itemfrontimage-src-replace-' onchange='showImage(event)'>"

            +
            "<br><label id='itemfrontimage-ererrormsg-" + itemArray[i].itemid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<br><input type='button' value='Upload New Image' data-errormsgelementid='itemfrontimage-ererrormsg-' data-facing='front' data-saveasnameelementid='image-' data-fileelementid='itemfrontimage-replace-' data-itemid = '" + itemArray[i].itemid + "' onclick='uploadFile(event);'  >"


            //back Image

            +
            "<br><br>Back Image:(Image should be about square size min 600px X 600px) <br><img id='itembackimage-src-replace-" + itemArray[i].itemid + "' src='/goodsandgift/img/" + itemArray[i].image + "_back.png' style='width: 200px; height: 200px; background-color: white;' alt='Image not available' />" +
            "<br>Replace Back Image:" +
            "<br><input type='file'  id='itembackimage-replace-" + itemArray[i].itemid + "' data-itemid = '" + itemArray[i].itemid + "'   data-imageelementid='itembackimage-src-replace-' onchange='showImage(event)'>"

            +
            "<br><label id='itembackimage-ererrormsg-" + itemArray[i].itemid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<br><input type='button' value='Upload New Image' data-errormsgelementid='itembackimage-ererrormsg-' data-facing='back' data-saveasnameelementid='image-' data-fileelementid='itembackimage-replace-' data-itemid = '" + itemArray[i].itemid + "' onclick='uploadFile(event);'  >"

            +
            "</div>"



            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Quantities Available</div>"

            +
            "<div style='border:1px solid #333; border-radius: 5px; width:95%; padding: 5px; font-size: 12px; text-align: justify; text-justify: inter-word; background-color: #ecf1f1' >Quanitity remaining gets updated dynamically based on number of items ordered. <br><br>Update initial quantity = Current IQ - Current QR + Actually avaiable.<br><br> Then update Quanitity Remaining to actually available.</div>"

            +
            "<br>Quanitity Remaining (QR): <br>" +
            "<input type='text' id='quantitiesremaining-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].quantitiesremaining + "'>"

            +
            "<br>Initial Quanitity (IQ): <br>" +
            "<input type='text' id='quantityinitial-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].quantityinitial + "'>" +
            "</div>"


            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Customizations Allowed</div>" +
            "<br>Allow custom text: <br>(1 for yes/0 for no) <br>" +
            "<input type='text' id='allowcustomtext-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].allowcustomtext + "'>"

            +
            "<br><br>Allow add art: <br>(1 for yes/0 for no) <br>" +
            "<input type='text' id='allowaddart-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].allowaddart + "'>"


            +
            "<br><br>Allow custom image: <br>(1 for yes/0 for no) <br>" +
            "<input type='text' id='allowcustomimage-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].allowcustomimage + "'>"

            +
            "<br><br>Allow custom note: <br>(1 for yes/0 for no) <br>" +
            "<input type='text' id='allowcustomnote-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].allowcustomnote + "'>"


            +
            "<br><br>Color Options: <br>(Sample: #FFFF00-Yellow;#FFFFFF-White) <br>Leave blank if no colors applicable.<br>" +
            "<textarea class='span2 fullWidth' id='coloroptions-" + itemArray[i].itemid + "' style='width:95%; ' rows='4' cols='8'>" + itemArray[i].coloroptions + "</textarea>" +
            "</div>"

            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Additional Information to gather from buyer</div>"

            +
            "<br>Question/Instruction for Additional Information Required: <br>(Leave blank if not applicable)<br>" +
            "<textarea class='span2 fullWidth' id='questionforaddnote-" + itemArray[i].itemid + "' style='width:95%; ' rows='4' cols='8'>" + itemArray[i].questionforaddnote + "</textarea>"

            +
            "<br><br>Fields for which data is needed in response: <br>(Seperate the fields by ;) <br> Leave blank if not applicable<br>" +
            "<textarea class='span2 fullWidth' id='userinputsrequired-" + itemArray[i].itemid + "' style='width:95%; ' rows='4' cols='8'>" + itemArray[i].userinputsrequired + "</textarea><br>"

            +
            "<br>Cricut Design Size Factor: <br>(Decimal number to muliply the size so that impage is cut right size in Cricut design space) <br>" +
            "<input type='text' id='cridesignsizefactor-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].cridesignsizefactor + "'>"

            +
            "<br>Canvas front string: <br>(To be used for template items) <br>" +
            "<input type='text' id='canvasfrontstring-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].canvasfrontstring + "'>"

            +
            "<br>Canvas back string: <br>(To be used for template items) <br>" +
            "<input type='text' id='canvasbackstring-" + itemArray[i].itemid + "' style='width:95%; margin:auto;' value='" + itemArray[i].canvasbackstring + "'>"

            +
            "</div>"


            +
            "<label id='updateitemerrormsg-" + itemArray[i].itemid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<div class = 'saveChangesDivCls'><button  type='button' class='btn btn-primary' onclick=updateItem('" + itemArray[i].itemid + "','n') >Save Changes</button>" +
            "<button   type='button' class='btn btn-primary' onclick=updateItem('" + itemArray[i].itemid + "','y') >Save As New Item</button></div>" +
            "<br></div></div>";


    }

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";

    document.getElementById("showOrdersDivId").innerHTML = output;
    document.getElementById("showOrdersDivId").style.display = "block";
}


function showMdaArts() {
    var xyz = JSON.parse(localStorage.getItem("artList"));
    var artArray = JSON.parse(xyz);

    var output = "";
    var params = "";
    output = "<button  style='float: right' type='button' class='btn btn-primary' onclick=updateArt('','y') >Add New Art Item</button>";

    for (var i = 0; i < artArray.length; i++) {

        output += "<div class=' currentlyoffereditem-" + artArray[i].imageoffered + " orderIdHdrDivCls' data-toggle='collapse' data-target='#table-" + artArray[i].imageid + "' style='padding-bottom: 30px;'>  Name: " + artArray[i].imagedisplayname + "<br> Category: " + artArray[i].imagecategory + "<br>Subcategory: " + artArray[i].imagesubcategory;

        output += "<div style='height: 100px; width:100px; border-radius:5px; background-size: cover; background-repeat: no-repeat; background-color:#fff;  background-image:url(" + '"imgart/' + artArray[i].imagefilename + '"' + ") '></div>";

        output += "<i style='font-size:18px; float: right;' class='fa'>&#xf0b2;</i></div> ";



        output += "<div class='collapse' id='table-" + artArray[i].imageid + "'>";

        output += "<table class='table'><tr style='background-color:#FCFBFB; box-shadow: 1px 1px 2px #222222; '>" +
            "<td style='position: relative; padding-top:60px'>"
        output += "</td>" +
            "</tr></table>";


        output += "<div class='addressOnMyOrders'>"

            +
            "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>DETAILS</div>" +
            "Name: <br>" +
            "<input type='text'  id='imagedisplayname-" + artArray[i].imageid + "' style='width:95%; margin:auto;' value='" + artArray[i].imagedisplayname + "'>" +
            "<br><br>Item Category:<br>" +
            "<input type='text'  id='imagecategory-" + artArray[i].imageid + "' style='width:95%; margin:auto;' value='" + artArray[i].imagecategory + "'>" +
            "<br><br>Sub Category:<br>" +
            "<input type='text'  id='imagesubcategory-" + artArray[i].imageid + "' style='width:95%; margin:auto;' value='" + artArray[i].imagesubcategory + "'>"

            +
            "<br><br>Additional Info:<br>" +
            "<textarea class='span2 fullWidth' id='additionalinfo-" + artArray[i].imageid + "' style='width:95%; ' rows='4' cols='8'>" + artArray[i].additionalinfo + "</textarea>"

            +
            "<br><br>Currently Offered: (1 for yes/ 0 for no)<br>" +
            "<input type='text'  id='imageoffered-" + artArray[i].imageid + "' style='width:95%; margin:auto;' value='" + artArray[i].imageoffered + "'>"

            +
            "</div>"




        // image update

        output += "<div class='itemInfoDisplayDivCls'> <div class='categoryHeader'>Image</div>"

            +
            "Image:(e.g. myimage.png)" +
            "<input type='text' id='imagefilename-" + artArray[i].imageid + "' style='width:95%; margin:auto;'  value='" + artArray[i].imagefilename + "'>"

            +
            "<br><img id='imagefilename-src-replace-" + artArray[i].imageid + "' src='/goodsandgift/imgart/" + artArray[i].imagefilename + "' style='width: 200px; height: 200px; background-color: white;' alt='Image not available' />"

            +
            "<br><input type='file'  id='imagefilename-replace-" + artArray[i].imageid + "' data-imageid = '" + artArray[i].imageid + "'   data-imageelementid='imagefilename-src-replace-' onchange='showArtImage(event)'>"

            +
            "<br><label id='imagefilename-ererrormsg-" + artArray[i].imageid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<br><input type='button' value='Upload New Image' data-errormsgelementid='imagefilename-ererrormsg-' data-saveasnameelementid='imagefilename-' data-fileelementid='imagefilename-replace-' data-imageid = '" + artArray[i].imageid + "' onclick='uploadArtFile(event);'  >";




        output += "<label id='updateitemerrormsg-" + artArray[i].imageid + "' style='color: #cc0000; font-size: 14px; min-height: 20px;'></label>"

            +
            "<div class = 'saveChangesDivCls'><button  type='button' class='btn btn-primary' onclick=updateArt('" + artArray[i].imageid + "','n') >Save Changes</button>" +
            "<button   type='button' class='btn btn-primary' onclick=updateArt('" + artArray[i].imageid + "','y') >Save As New Art</button></div>" +
            "<br></div>";

        output += "</div></div></div>";

    }

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";

    document.getElementById("showOrdersDivId").innerHTML = output;
    document.getElementById("showOrdersDivId").style.display = "block";
}

function populateItemListInDropDown() {
    //Populate the item list
    var xyz = JSON.parse(localStorage.getItem("itemList"));
    var tags = JSON.parse(xyz);
    var selectList = document.getElementById("itemListDropDownId");

    var i, L = selectList.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectList.remove(i);
    }

    for (index in tags) {
        //select.options[select.options.length] = new Option(tags[index].itemname, index);
        if (index == 1) {
            the.firstIndexItemId = tags[index].itemid;
        }
        var opt = document.createElement("option");
        opt.value = tags[index].itemid;
        opt.text = tags[index].itemname;
        selectList.appendChild(opt);
        //opt.innerHTML = element; 
    }
}

function getOrderList() {
    var tags = the.OrderList_LclJson;
    if (tags != null) {
        if (tags != "") {
            return;
        }
    }

    var emailid = sessionStorage.getItem("userEmail");

    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getOrderList",
            customeremail: emailid
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //alert(response);
            //var tags = JSON.parse(response);
            //sessionStorage.setItem("LanguageHelpCodeAndIds", JSON.stringify(response));
            //console.log(response);
            the.OrderList_LclJson = response;
        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}



function showProduct(itemid, refreshPage, loadCanvasFromTemplate) {
    var path = window.location.pathname;
    localStorage.setItem("curProductItem", itemid);
    var pageName = "product";

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("showOrdersDivId").style.display = "none";


    //myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?product=" + itemid;
    myUrl = window.location.protocol + "//" + window.location.host + path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1) + "product/" + itemid;


    if (refreshPage != "n") {
        window.location.href = myUrl;
        return;
    }
    const nextURL = myUrl;
    const nextTitle = 'Code Helper';
    const nextState = {
        additionalInformation: 'Updated the URL with JS'
    };

    // This will create a new entry in the browser's history, without reloading
    window.history.pushState(nextState, nextTitle, nextURL);


    x = document.getElementById("productLinkId");
    x.classList.remove("active");

    x = document.getElementById("loginLinkId");
    x.classList.remove("active");

    x = document.getElementById("logoutLinkId");
    x.classList.remove("active");

    x = document.getElementById("contactusLinkId");
    x.classList.remove("active");


    x = document.getElementById("homeLinkId");
    x.classList.remove("active");

    x = document.getElementById("cartLinkId");
    x.classList.remove("active");
    //SM: TODO
    x = document.getElementById(pageName + "LinkId");
    x.className += " active";

    var displayItemNmNId = itemid;
    if (displayItemNmNId.indexOf('-') > 0) {
        var br = displayItemNmNId.split('-');
        itemid = br[br.length - 1];
    } else {
        itemid = displayItemNmNId;
    }

    showProductForItemId(itemid, loadCanvasFromTemplate);

    //populateItemListInDropDown();
    //var selectList = document.getElementById("itemListDropDownId");
    //selectList.value = itemid;

    window.scrollTo(0, 0);

}

function showProductForItemId(itemid, loadCanvasFromTemplate) {
    var metaDesc = "";
    var metaKey = "";
    var metaTitle = "";

    localStorage.setItem("curProductItem", itemid);
    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);
    var itemFound = false;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].itemid == itemid) {
            itemFound = true;
            var keywords = rows[i].keyword;
            if (keywords == "null" ) {
                keywords = "";                
            }
            var text = "";
            
            try {
                var html = rows[i].itemdesc ;
                var div = document.createElement("div");
                div.innerHTML = html;
                text = div.textContent || div.innerText || "";
            }catch(err) {
            }

            metaDesc = "Custom design " + rows[i].category +  "." + text + ". Order online, various customization options, fast service, quality products. Free pick.";
            metaKey = "Custom, design, printed, " + rows[i].category + ", Ottawa, Stittsville, Canada, " + keywords;

            metaTitle = rows[i].category + " - Customizations"

            document.getElementById('addToCartBtnDivId').innerHTML = '<button data-itemid="' + itemid + '" data-name="Lemon" data-price="5" class="add-to-cart btnCanvas" style="padding: 2px; height: 40px; margin-top: 5px;" onclick="addToCart(' + "'" + itemid + "'" + ')" ><i class="fa fa-cart-plus" style="font-size:24px; aria-hidden="true"></i> <span class="menu_text_two"> Add to cart</span></button>';

            document.getElementById("customItemDiv").style.backgroundImage = "url('/goodsandgift/img/" + rows[i].image + "_front.png')";

            if (rows[i].hasmultipleimages == null) {
                document.getElementById("flip").style.display = "none";
            } else if (rows[i].hasmultipleimages == 1) {
                document.getElementById("flip").style.display = "block";
            } else {
                document.getElementById("flip").style.display = "none";
            }

			if (rows[i].vinyltype == "Permanent") {
				document.getElementById("permanentVinylColorsDiv").style.display = "flex";
				document.getElementById("htvColorsDiv").style.display = "none";

				document.getElementById("permanentVinylHolosDiv").style.display = "flex";
				document.getElementById("htvVinylHolosDiv").style.display = "none";				
				
				
			}else if (rows[i].vinyltype == "HTV") {
				document.getElementById("permanentVinylColorsDiv").style.display = "none";
				document.getElementById("htvColorsDiv").style.display = "flex";				

				document.getElementById("permanentVinylHolosDiv").style.display = "none";
				document.getElementById("htvVinylHolosDiv").style.display = "flex";	
			}
			
            if (rows[i].sizeoptionsnprice == null) {
                //document.getElementById("sizeOptionsMenuId").style.display = "none";
            } else if (rows[i].sizeoptionsnprice == 1) {
                // document.getElementById("sizeOptionsMenuId").style.display = "block";
            } else {
                //document.getElementById("sizeOptionsMenuId").style.display = "none";
            }

            if (rows[i].coloroptions == null) {
                document.getElementById("colorOptionsMenuId").style.display = "none";
                localStorage.setItem("coloreditem", "n");
            } else if (rows[i].coloroptions == "") {
                document.getElementById("colorOptionsMenuId").style.display = "none";
                localStorage.setItem("coloreditem", "n");
            } else {
                document.getElementById("colorOptionsMenuId").style.display = "block";
                localStorage.setItem("coloreditem", "y");
            }

            if (rows[i].allowcustomtext == null) {
                document.getElementById("addTextMenuId").style.display = "none";
            } else if (rows[i].allowcustomtext == 1) {
                document.getElementById("addTextMenuId").style.display = "block";
            } else {
                document.getElementById("addTextMenuId").style.display = "none";
            }

            if (rows[i].allowcustomnote == null) {
                document.getElementById("addNoteMenuId").style.display = "none";
            } else if (rows[i].allowcustomnote == 1) {
                document.getElementById("addNoteMenuId").style.display = "block";
            } else {
                document.getElementById("addNoteMenuId").style.display = "none";
            }

            if (rows[i].allowcustomimage == null) {
                document.getElementById("uploadImageMenuId").style.display = "none";
            } else if (rows[i].allowcustomimage == 1) {
                document.getElementById("uploadImageMenuId").style.display = "block";
            } else {
                document.getElementById("uploadImageMenuId").style.display = "none";
            }

            if (rows[i].allowaddart == null) {
                document.getElementById("addArtMenuId").style.display = "none";
            } else if (rows[i].allowaddart == 1) {
                document.getElementById("addArtMenuId").style.display = "block";
            } else {
                document.getElementById("addArtMenuId").style.display = "none";
            }

            var firstColorOption = "";
            if (rows[i].coloroptions != null) {
                if (rows[i].coloroptions.includes(";")) {
                    var colorArr = rows[i].coloroptions.split(";");
                    var colorsHTML = '<ul class="nav">';
                    for (j = 0; j < colorArr.length; j++) {
                        var colorData = colorArr[j].split("-");
                        //var colorData = colorArr[j];
                        //colorsHTML = colorsHTML + '<li class="color-preview" title="'+ colorData[1] +'" style="background-color:'+ colorData[0] +';"></li>';
                        if (firstColorOption == "") {
                            firstColorOption = colorData[0];
                        }
                        colorsHTML = colorsHTML + '<li onclick="setBackgroundColor(' + "'" + colorArr[j] + "'" + ')" class="color-preview" title="' + colorData[1] + '" style="background-color:' + colorData[0] + ';"></li>';

                    }
                }
            }



            document.getElementById("itemPriceLabelId").innerHTML = "CAD " + rows[i].price;

            document.getElementById("add-note-string").value = "";

            document.getElementById("addInstrDivId").innerHTML = "Additional instructions";

            document.getElementById("itemDescDivId").innerHTML = rows[i].itemdesc;

            var nm = rows[i].userinputsrequired;

            if (nm != null) {
                if (nm.includes(";")) {
                    var userInputReqArr = rows[i].userinputsrequired.split(";");
                    var userInputText = "";

                    for (k = 0; k < userInputReqArr.length; k++) {
                        userInputText = userInputText + userInputReqArr[k] + '\r\n';
                    }
                    document.getElementById("add-note-string").value = userInputText;
                    document.getElementById("addInstrDivId").innerHTML = rows[i].questionforaddnote;
                }
            }

            colorsHTML = colorsHTML + '</ul>';

            colorsHTML = colorsHTML + '<br><div id="colorSelectedLblId" style="padding: 5px; height: 40px; font-size: 14px; font-weight: 400; color: #333 "></div>';
            document.getElementById("colorOptionDivId").innerHTML = colorsHTML;


            if (loadCanvasFromTemplate != "n") {
                if (rows[i].canvasfrontstring != '') {
                    var itemid = rows[i].itemid;
                    var imgsrc = "item";
                    var backgrcolor = firstColorOption;
                    var frontString = rows[i].canvasfrontstring;
                    var backString = rows[i].canvasbackstring;


                    //loadTemplateItem(rows[i].itemid, "item", firstColorOption, rows[i].canvasfrontstring, rows[i].canvasbackstring )
                    var target = "/goodsandgift/" + imgsrc + "canvases/" + frontString;
                    $.ajax({
                        url: target,
                        success: function(data) {
                            //parse your data here
                            //you can split into lines using data.split('\n') 
                            //an use regex functions to effectively parse it
                            canvasFrontString = data;
							
							//SM: TEMP
							//canvasFrontString = enlargeCanvasJson(canvasFrontString, 0.5);
							
                            if (backString != '') {
                                target = "/goodsandgift/" + imgsrc + "canvases/" + backString;

                                $.ajax({
                                    url: target,
                                    success: function(dataB) {
										
										var ele = document.getElementById("customItemDiv");
										var canvaWidth = ele.offsetWidth;					
										var canvasSizeFactor = canvaWidth/600 ;		
										
                                        canvasBackString = dataB;
										canvasBackString = enlargeCanvasJson(canvasBackString, canvasSizeFactor);
                                        canvas.loadFromJSON(canvasFrontString);
                                        document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                                    }
                                })
                            } else {
                                localStorage.setItem("curProductItem", itemid);

								var ele = document.getElementById("customItemDiv");
								var canvaWidth = ele.offsetWidth;					
								var canvasSizeFactor = canvaWidth/600 ;
					
								canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
							                               
                                canvas.loadFromJSON(canvasFrontString);
                                document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                            }


                        }
                    });

                }
            }

            break;
        }
    }

    if (!itemFound) {
        showProduct(the.firstIndexItemId);
        return;
    }

    document.querySelector('meta[name="description"]').setAttribute("content", metaDesc);
    document.querySelector('meta[name="keywords"]').setAttribute("content", metaKey);
    document.title = metaTitle ;

    const structuredData = {
        "@context": "https://schema.org/",
        "@type":"WebSite",
        "name": "Custom design goods and gift items",
        "url": "https://goodsandgift.com/",
        "datePublished": "2022-07-10",
        "description": metaDesc ,
        "thumbnailUrl": "https://antaksharee.com/images/banner.png"    
      };
      
      let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      jsonLdScript.innerHTML = JSON.stringify(structuredData);


    document.getElementById("productDivId").style.display = "block";
    //document.getElementById("colorSelectedLblId").innerHTML = "";
    //document.getElementById('customItemFacing').src="/goodsandgift/img/crew_front.png";
    document.getElementById("productDivId").style.width = "100%";
    activateFirstDesignMenuItem();

}

function toggleSubNavContent(){
	if (document.getElementById("subnav-content-div").style.display == "block"){
		document.getElementById("subnav-content-div").style.display = "none";
	} else{
		document.getElementById("subnav-content-div").style.display = "block";
	}
}

function toggleFontFamily(){
	if (document.getElementById("textFontFamily").style.display == "block"){
		document.getElementById("textFontFamily").style.display = "none";
	} else{
		document.getElementById("textFontFamily").style.display = "block";
	}
}

function showMDAProduct(itemid, refreshPage, loadCanvasFromTemplate) {

    localStorage.setItem("curProductItem", itemid);
    var pageName = "product";

    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("showOrdersDivId").style.display = "none";


    myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?product=" + itemid;


    if (refreshPage != "n") {
        window.location.href = myUrl;
        return;
    }
    const nextURL = myUrl;
    const nextTitle = 'Code Helper';
    const nextState = {
        additionalInformation: 'Updated the URL with JS'
    };

    // This will create a new entry in the browser's history, without reloading
    window.history.pushState(nextState, nextTitle, nextURL);


    x = document.getElementById("productLinkId");
    x.classList.remove("active");

    x = document.getElementById("loginLinkId");
    x.classList.remove("active");

    x = document.getElementById("logoutLinkId");
    x.classList.remove("active");

    x = document.getElementById("contactusLinkId");
    x.classList.remove("active");


    x = document.getElementById("homeLinkId");
    x.classList.remove("active");

    x = document.getElementById("cartLinkId");
    x.classList.remove("active");
    //SM: TODO
    x = document.getElementById(pageName + "LinkId");
    x.className += " active";


    localStorage.setItem("curProductItem", itemid);
    var tf = JSON.parse(localStorage.getItem("mdaItemList"));

    if (tf != null) {
        if (tf != "") {
			showMDAItem(itemid, refreshPage, loadCanvasFromTemplate)
            return;
        }
    } 

    var customeremail = sessionStorage.getItem("userEmail");
    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getMdaItemsList",
            customeremail: customeremail
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            localStorage.setItem("mdaItemList", JSON.stringify(response));
            showMDAItem(itemid, refreshPage, loadCanvasFromTemplate);

        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });	
	
}


function showMDAItem(itemid, refreshPage, loadCanvasFromTemplate) {	
	var tf = JSON.parse(localStorage.getItem("mdaItemList"));
    var rows = JSON.parse(tf);
    var itemFound = false;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].itemid == itemid) {
            itemFound = true;

            document.getElementById('addToCartBtnDivId').innerHTML = '<button data-itemid="' + itemid + '" data-name="Lemon" data-price="5" class="add-to-cart btnCanvas" style="padding: 2px; height: 40px; margin-top: 5px;" onclick="addToCart(' + "'" + itemid + "'" + ')" ><i class="fa fa-cart-plus" style="font-size:24px; aria-hidden="true"></i> <span class="menu_text_two"> Add to cart</span></button>';

            document.getElementById("customItemDiv").style.backgroundImage = "url('/goodsandgift/img/" + rows[i].image + "_front.png')";

            if (rows[i].hasmultipleimages == null) {
                document.getElementById("flip").style.display = "none";
            } else if (rows[i].hasmultipleimages == 1) {
                document.getElementById("flip").style.display = "block";
            } else {
                document.getElementById("flip").style.display = "none";
            }

			if (rows[i].vinyltype == "Permanent") {
				document.getElementById("permanentVinylColorsDiv").style.display = "flex";
				document.getElementById("htvColorsDiv").style.display = "none";

				document.getElementById("permanentVinylHolosDiv").style.display = "flex";
				document.getElementById("htvVinylHolosDiv").style.display = "none";				
				
				
			}else if (rows[i].vinyltype == "HTV") {
				document.getElementById("permanentVinylColorsDiv").style.display = "none";
				document.getElementById("htvColorsDiv").style.display = "flex";				

				document.getElementById("permanentVinylHolosDiv").style.display = "none";
				document.getElementById("htvVinylHolosDiv").style.display = "flex";	
			}
			
            if (rows[i].sizeoptionsnprice == null) {
                //document.getElementById("sizeOptionsMenuId").style.display = "none";
            } else if (rows[i].sizeoptionsnprice == 1) {
                // document.getElementById("sizeOptionsMenuId").style.display = "block";
            } else {
                //document.getElementById("sizeOptionsMenuId").style.display = "none";
            }

            if (rows[i].coloroptions == null) {
                document.getElementById("colorOptionsMenuId").style.display = "none";
                localStorage.setItem("coloreditem", "n");
            } else if (rows[i].coloroptions == "") {
                document.getElementById("colorOptionsMenuId").style.display = "none";
                localStorage.setItem("coloreditem", "n");
            } else {
                document.getElementById("colorOptionsMenuId").style.display = "block";
                localStorage.setItem("coloreditem", "y");
            }

            if (rows[i].allowcustomtext == null) {
                document.getElementById("addTextMenuId").style.display = "none";
            } else if (rows[i].allowcustomtext == 1) {
                document.getElementById("addTextMenuId").style.display = "block";
            } else {
                document.getElementById("addTextMenuId").style.display = "none";
            }

            if (rows[i].allowcustomnote == null) {
                document.getElementById("addNoteMenuId").style.display = "none";
            } else if (rows[i].allowcustomnote == 1) {
                document.getElementById("addNoteMenuId").style.display = "block";
            } else {
                document.getElementById("addNoteMenuId").style.display = "none";
            }

            if (rows[i].allowcustomimage == null) {
                document.getElementById("uploadImageMenuId").style.display = "none";
            } else if (rows[i].allowcustomimage == 1) {
                document.getElementById("uploadImageMenuId").style.display = "block";
            } else {
                document.getElementById("uploadImageMenuId").style.display = "none";
            }

            if (rows[i].allowaddart == null) {
                document.getElementById("addArtMenuId").style.display = "none";
            } else if (rows[i].allowaddart == 1) {
                document.getElementById("addArtMenuId").style.display = "block";
            } else {
                document.getElementById("addArtMenuId").style.display = "none";
            }

            var firstColorOption = "";
            if (rows[i].coloroptions != null) {
                if (rows[i].coloroptions.includes(";")) {
                    var colorArr = rows[i].coloroptions.split(";");
                    var colorsHTML = '<ul class="nav">';
                    for (j = 0; j < colorArr.length; j++) {
                        var colorData = colorArr[j].split("-");
                        //var colorData = colorArr[j];
                        //colorsHTML = colorsHTML + '<li class="color-preview" title="'+ colorData[1] +'" style="background-color:'+ colorData[0] +';"></li>';
                        if (firstColorOption == "") {
                            firstColorOption = colorData[0];
                        }
                        colorsHTML = colorsHTML + '<li onclick="setBackgroundColor(' + "'" + colorArr[j] + "'" + ')" class="color-preview" title="' + colorData[1] + '" style="background-color:' + colorData[0] + ';"></li>';

                    }
                }
            }



            document.getElementById("itemPriceLabelId").innerHTML = "CAD " + rows[i].price;

            document.getElementById("add-note-string").value = "";

            document.getElementById("addInstrDivId").innerHTML = "Additional instructions";

            document.getElementById("itemDescDivId").innerHTML = rows[i].itemdesc;

            var nm = rows[i].userinputsrequired;

            if (nm != null) {
                if (nm.includes(";")) {
                    var userInputReqArr = rows[i].userinputsrequired.split(";");
                    var userInputText = "";

                    for (k = 0; k < userInputReqArr.length; k++) {
                        userInputText = userInputText + userInputReqArr[k] + '\r\n';
                    }
                    document.getElementById("add-note-string").value = userInputText;
                    document.getElementById("addInstrDivId").innerHTML = rows[i].questionforaddnote;
                }
            }

            colorsHTML = colorsHTML + '</ul>';

            colorsHTML = colorsHTML + '<br><div id="colorSelectedLblId" style="padding: 5px; height: 40px; font-size: 14px; font-weight: 400; color: #333 "></div>';
            document.getElementById("colorOptionDivId").innerHTML = colorsHTML;


            if (loadCanvasFromTemplate != "n") {
                if (rows[i].canvasfrontstring != '') {
                    var itemid = rows[i].itemid;
                    var imgsrc = "item";
                    var backgrcolor = firstColorOption;
                    var frontString = rows[i].canvasfrontstring;
                    var backString = rows[i].canvasbackstring;


                    //loadTemplateItem(rows[i].itemid, "item", firstColorOption, rows[i].canvasfrontstring, rows[i].canvasbackstring )
                    var target = "/goodsandgift/" + imgsrc + "canvases/" + frontString;
                    $.ajax({
                        url: target,
                        success: function(data) {
                            //parse your data here
                            //you can split into lines using data.split('\n') 
                            //an use regex functions to effectively parse it
                            canvasFrontString = data;
							
							//SM: TEMP
							//canvasFrontString = enlargeCanvasJson(canvasFrontString, 0.5);
							
                            if (backString != '') {
                                target = "/goodsandgift/" + imgsrc + "canvases/" + backString;

                                $.ajax({
                                    url: target,
                                    success: function(dataB) {
										
										var ele = document.getElementById("customItemDiv");
										var canvaWidth = ele.offsetWidth;					
										var canvasSizeFactor = canvaWidth/600 ;		
										
                                        canvasBackString = dataB;
										canvasBackString = enlargeCanvasJson(canvasBackString, canvasSizeFactor);
                                        canvas.loadFromJSON(canvasFrontString);
                                        document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                                    }
                                })
                            } else {
                                localStorage.setItem("curProductItem", itemid);

								var ele = document.getElementById("customItemDiv");
								var canvaWidth = ele.offsetWidth;					
								var canvasSizeFactor = canvaWidth/600 ;
					
								canvasFrontString = enlargeCanvasJson(canvasFrontString, canvasSizeFactor);
							
                                canvas.loadFromJSON(canvasFrontString);
                                document.getElementById("customItemDiv").style.backgroundColor = backgrcolor;
                            }


                        }
                    });

                }
            }

            break;
        }
    }

    if (!itemFound) {
        showProduct(the.firstIndexItemId);
        return;
    }
    document.getElementById("productDivId").style.display = "block";
    //document.getElementById("colorSelectedLblId").innerHTML = "";
    //document.getElementById('customItemFacing').src="/goodsandgift/img/crew_front.png";
    document.getElementById("productDivId").style.width = "100%";
    activateFirstDesignMenuItem();
    window.scrollTo(0, 0);	
}


function setBackgroundColor(color) {
    var colorData = color.split("-");
    document.getElementById("colorSelectedLblId").innerHTML = "Selected: " + colorData[1];
    document.getElementById("customItemDiv").style.backgroundColor = colorData[0];
}

function Show(pageName) {
    //console.log ("Show called for page " + pageName);

    //document.getElementById("filelvlhelpdivid").style.display = "none";
    var path = window.location.pathname;
    if (onMobileBrowser()) {

        var x = document.getElementById("myTopnav");
        x.className = "topnav";

    } else {

    }

    if (pageName == "product") {

        if (path.indexOf('product/') > 0) {
            return;
        }
    }
    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";
    document.getElementById("showCartDivId").style.display = "none";
    document.getElementById("addToCartModal").style.display = "none";
    document.getElementById("orderConfirmationDivId").style.display = "none";
    document.getElementById("showOrdersDivId").style.display = "none";
    document.getElementById("mdaPics").style.display = "none";

    myUrl = window.location.protocol + "//" + window.location.host +
        window.location.pathname + "?target=" + pageName;



    const nextURL = myUrl;
    const nextTitle = 'Code Helper';
    const nextState = {
        additionalInformation: 'Updated the URL with JS'
    };

    // This will create a new entry in the browser's history, without reloading
    window.history.pushState(nextState, nextTitle, nextURL);


    //x = document.getElementById("custommugsLinkId");
    //x.classList.remove("active");

    x = document.getElementById("productLinkId");
    x.classList.remove("active");

    x = document.getElementById("loginLinkId");
    x.classList.remove("active");

    x = document.getElementById("logoutLinkId");
    x.classList.remove("active");

    x = document.getElementById("contactusLinkId");
    x.classList.remove("active");


    x = document.getElementById("homeLinkId");
    x.classList.remove("active");

    x = document.getElementById("cartLinkId");
    x.classList.remove("active");

    //populateLanguages("helpTopics-lang-box");

    x = document.getElementById(pageName + "LinkId");
    x.className += " active";
    //x.style.display = "block";

    if (pageName == "custommugs") {


        document.getElementById("productDivId").style.display = "block";
        //document.getElementById("colorSelectedLblId").innerHTML = "";
        //document.getElementById('customItemFacing').src="/goodsandgift/img/phone_front.png";
        document.getElementById("customItemDiv").style.backgroundImage = "url('/goodsandgift/img/phone_front.png')";
        document.getElementById("productDivId").style.width = "100%";
        //document.getElementById("custommugsDivId").style.width = "100%";   



    } else if (pageName == "product") {

        if (path.indexOf('product/') > 0) {
            return;
        }

        document.getElementById("productDivId").style.display = "block";
        //document.getElementById("colorSelectedLblId").innerHTML = "";
        //document.getElementById('customItemFacing').src="/goodsandgift/img/crew_front.png";
        document.getElementById("customItemDiv").style.backgroundImage = "url('/goodsandgift/img/crew_front.png')";
        document.getElementById("productDivId").style.width = "100%";

        var lastItem = localStorage.getItem("curProductItem");
        if (lastItem == null) {
            showProduct(the.firstIndexItemId);
        } else if (lastItem == "null") {
            showProduct(the.firstIndexItemId);
        } else {
            showProduct(lastItem);
        }


    } else if (pageName == "login") {

        document.getElementById("productDivId").style.display = "none";

        document.getElementById("loginDivId").style.display = "block";

        document.getElementById("loginSecDivId").style.display = "block";
        document.getElementById("registerSecDivId").style.display = "none";
        document.getElementById("forgotPasswordSecDivId").style.display = "none";
        document.getElementById("accActivatedDivId").style.display = "none";
        document.getElementById("forgotPWDivId").style.display = "none";

        document.getElementById("loginerrormsg").innerHTML = "";


    } else if (pageName == "contactus") {

        //document.getElementById("HelpTopicsDivId").style.display = "none";
        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "block";

        document.getElementById("contactuserrormsg").innerHTML = "";

        refreshCaptcha();

    } else if (pageName == "home") {

        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "none";
        document.getElementById("homeDivId").style.display = "block";
        //document.getElementById("homeDivId").style.width = "95%";
        populateItemList();
    } else if (pageName == "cart") {

        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "none";
        document.getElementById("homeDivId").style.display = "none";
        document.getElementById("showCartDivId").style.display = "block";
        document.getElementById("checkOutDivId").style.display = "none";
        //displayCart();


        ;
    }
    window.scrollTo(0, 0);
}
function hideMenuDetails(){
	document.getElementById("designMenuNOptionsDivId").style.height = "0%";
	document.getElementById("designMenuNOptionsDivId").style.paddingTop = "0px";
}
function ShowDesignMenu(name, firstLoadFlag) {

	var ele = document.getElementById("designMenuNavListId");
	var eleWidth = ele.offsetWidth;	

	if (eleWidth > 100){
		
		//document.getElementById("infoNToolBar-two").style.display = "none";
		if (firstLoadFlag){
			document.getElementById("designMenuNOptionsDivId").style.height = "0%";
			document.getElementById("designMenuNOptionsDivId").style.paddingTop = "0px";
		} else {
			
			document.getElementById("designMenuNOptionsDivId").style.height = "70%";
			document.getElementById("designMenuNOptionsDivId").style.paddingTop= "40px";
		}
	} else {
		//document.getElementById("infoNToolBar-one").style.display = "none";
	}
	//document.getElementById("designMenuNOptionsDivId").style.display = "flex";
    document.getElementById("styleOptionsDivId").style.display = "none";
    document.getElementById("addArtDivId").style.display = "none";
    document.getElementById("itemDescDivId").style.display = "none";
    document.getElementById("colorOptionDivId").style.display = "none";
    document.getElementById("addTextDivId").style.display = "none";
    document.getElementById("uplaodImageDivId").style.display = "none";
    document.getElementById("addArtDivId").style.display = "none";
    document.getElementById("addNoteDivId").style.display = "none";

    //x = document.getElementById("styleOptionsLinkId");
    //x.classList.remove("active");

    x = document.getElementById("itemDescLinkId");
    x.classList.remove("active");

    x = document.getElementById("colorOptionLinkId");
    x.classList.remove("active");

    x = document.getElementById("addTextLinkId");
    x.classList.remove("active");

    x = document.getElementById("uplaodImageLinkId");
    x.classList.remove("active");

    x = document.getElementById("addArtLinkId");
    x.classList.remove("active");

    x = document.getElementById("addNoteLinkId");
    x.classList.remove("active");

    if (name == "addArt") {
        displayArtCategories();
    }
    x = document.getElementById(name + "LinkId");
	
	if (eleWidth <= 100){
		x.className += " active";
	}else if (!firstLoadFlag){
		 x.className += " active";
	}
	
    document.getElementById(name + "DivId").style.display = "block";
}

function displayArtCategories() {
    var innerHTML = "";

    var xyz = JSON.parse(localStorage.getItem("artList"));
    var rows = JSON.parse(xyz);


    for (var i = 0; i < rows.length; i++) {

        if (i == 0) {
            innerHTML += "<div class='artCategorycard' onclick='showArtUnderCatg(" + '"' + rows[i].imagecategory + '"' + ")'> " + rows[i].imagecategory + "</div>";
        } else if (rows[i].imagecategory != rows[i - 1].imagecategory) {
            innerHTML += "<div class='artCategorycard' onclick='showArtUnderCatg(" + '"' + rows[i].imagecategory + '"' + ")'> " + rows[i].imagecategory + "</div>";
        }

    }
    //innerHTML+= "<div class='msgDivAtBottomCls'>Please refresh the page to retry if you experience issue while designing</div>";
    document.getElementById("avatarListDivId").innerHTML = innerHTML;
    document.getElementById("addArtDivId").style.display = "block";
}

function showArtUnderCatg(catg) {
    var innerHTML = "";

    var xyz = JSON.parse(localStorage.getItem("artList"));
    var rows = JSON.parse(xyz);


    for (var i = 0; i < rows.length; i++) {

        if ((rows[i].imagecategory == catg) && (rows[i].imageoffered == "1")) {
            innerHTML += '<img style="cursor:pointer;" onclick="addImageToCanvas(event);" class="art-img-icon" src="/goodsandgift/imgart/' + rows[i].imagefilename + '">';
        }

    }
    innerHTML += "";
    //innerHTML+= "<div class='msgDivAtBottomCls'>Please refresh the page to retry if you experience issue while designing</div>";
    document.getElementById("avatarListDivId").innerHTML = innerHTML;
    document.getElementById("addArtDivId").style.display = "block";
}


function searchArt() {
    var artToSearchOrig = document.getElementById("searchArtTextId").value;
    var artToSearch = artToSearchOrig.trim();

    artToSearch = artToSearch.toUpperCase();

    var tf = JSON.parse(localStorage.getItem("artList"));
    var rows = JSON.parse(tf).filter(function(entry) {
        var imagecategory = entry.imagecategory;
        imagecategory = imagecategory.toUpperCase();

        var imagesubcategory = entry.imagesubcategory;
        imagesubcategory = imagesubcategory.toUpperCase();

        var imagedisplayname = entry.imagedisplayname;
        imagedisplayname = imagedisplayname.toUpperCase();

        return (imagedisplayname.includes(artToSearch) || imagecategory.includes(artToSearch) || imagesubcategory.includes(artToSearch)) && (entry.imageoffered == "1");
    });




    var innerHTML = "";
    var rowcount = rows.length;
    for (var i = 0; i < rows.length; i++) {
        innerHTML += '<img style="cursor:pointer;" onclick="addImageToCanvas(event);" class="art-img-icon" src="/goodsandgift/imgart/' + rows[i].imagefilename + '">';

    }
    innerHTML += "";
    //innerHTML+= "<div class='msgDivAtBottomCls'>Please refresh the page to retry if you experience issue while designing</div>";
    document.getElementById("avatarListDivId").innerHTML = innerHTML;
    document.getElementById("addArtDivId").style.display = "block";

    if (artToSearch == "") {
        document.getElementById("artSearchResultsLblDiv").style.display = "none";

    } else {
        document.getElementById("artSearchResultsLblDiv").style.display = "flex";
        if (rowcount == 0) {
            document.getElementById("artSearchResultsLbl").innerHTML = "No results found";
        } else {
            document.getElementById("artSearchResultsLbl").innerHTML = "Search results";
        }
    }

}

function searchArtEntered() {
    if (event.keyCode === 13) {
        searchArt();
    }
}

function resetArtSearch() {
    document.getElementById("artSearchResultsLblDiv").style.display = "none";
    document.getElementById("searchArtTextId").value = "";
    displayArtCategories();
}

function activateFirstDesignMenuItem() {
    //var elem1 = document.getElementById("colorOptionLinkId").style.display;
    //var elem2 = document.getElementById("loaderDivId").style.display;
    //var elem2 = document.getElementById("styleOptionsLinkId").style.display;
    //console.log(elem1);


    var name = "";
    //if (document.getElementById("sizeOptionsMenuId").style.display != "none") {
    //    name = "styleOptions";
    //} else 

    if (document.getElementById("itemDescMenuId").style.display != "none") {
        name = "itemDesc";
    } else if (document.getElementById("colorOptionsMenuId").style.display != "none") {
        name = "colorOption";
    } else if (document.getElementById("addTextMenuId").style.display != "none") {
        name = "addText";
    } else if (document.getElementById("addArtMenuId").style.display != "none") {
        name = "addArt";
    } else if (document.getElementById("uploadImageMenuId").style.display != "none") {
        name = "uplaodImage";
    }

    ShowDesignMenu(name, true);
}

function showCreateAccount() {
    document.getElementById("loginSecDivId").style.display = "none";
    document.getElementById("registerSecDivId").style.display = "block";
}

function showLogin() {
    document.getElementById("loginSecDivId").style.display = "block";
    document.getElementById("registerSecDivId").style.display = "none";
    document.getElementById("forgotPasswordSecDivId").style.display = "none";
    document.getElementById("accActivatedDivId").style.display = "none";
    document.getElementById("forgotPWDivId").style.display = "none";
}

function showForgotPassword() {
    document.getElementById("loginSecDivId").style.display = "none";
    document.getElementById("forgotPasswordSecDivId").style.display = "block";
}


function listVideos() {

    var tf = JSON.parse(sessionStorage.getItem("HowToVideos"));

    if (tf == null) {
        return;
    }
    var rows = JSON.parse(tf);

    if (rows.length < 2) {
        return;
    }
    var innerHTML = '';

    innerHTML = innerHTML + "<div class='videoListContainer'>";

    innerHTML = innerHTML + '<div id="prjSelectionMsg" style=" padding: 5px; text-align: justify; text-justify: inter-word; border: 1px solid #ccc; color: #f1f1f1;background: rgba(9, 84, 132, 1); margin-Bottom: 0px">How to videos</div>';



    for (var i = 0; i < rows.length; i++) {
        var description = rows[i].description;
        var url = rows[i].url;

        innerHTML = innerHTML + "<div class='videoDescription'>" + description + "</div> <div class='videoIframeDiv'><iframe class='videoIframe' src= '" + url + "'> </iframe>"
    }
    innerHTML = innerHTML + "</div>";

    document.getElementById("howtoDivId").innerHTML = innerHTML;

}

function showMobileMenu(pageName) {}

function resizeCanvas() {}

function resizeCanvasX() {
    var canvas = new fabric.Canvas('tcanvas');
    var newW = $("#drawingArea").width();
    var newH = $("#drawingArea").height();
    //newW = 400;
    //newH = 400;

    //console.log(newW);
    //console.log(newH);

    /*  $wrapper.add('.refs').css({
      width: canW,
      height: canH
    }); */

    canvas.setDimensions({
        width: newW,
        height: newH
    });
    //canvas.renderAll();	
}

function checkURL() {
    //console.log("inside checkURL");



    var myUrl = window.location.protocol + "//" + window.location.host +
        window.location.pathname;

    var LocationSearchStr = location.search;
    var find = '%20';
    var re = new RegExp(find, 'g');
    var pageName = "home";
    var path = window.location.pathname;

    LocationSearchStr = LocationSearchStr.replace(re, ' ');

    if (LocationSearchStr.indexOf('passkey=') > 0) {
        var ar = LocationSearchStr.split('passkey=');
        var accountactivationkey = ar[1];
        activateAccount(accountactivationkey);
        return;
    }

    if (LocationSearchStr.indexOf('resetkey=') > 0) {
        var ar = LocationSearchStr.split('resetkey=');
        var passwordresetkey = ar[1];
        //resetPassword(passwordresetkey);
        sessionStorage.setItem("passwordresetkey", passwordresetkey);


        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "none";
        document.getElementById("homeDivId").style.display = "none";
        document.getElementById("showCartDivId").style.display = "none";
        document.getElementById("addToCartModal").style.display = "none";
        document.getElementById("orderConfirmationDivId").style.display = "none";
        document.getElementById("showOrdersDivId").style.display = "none";
        document.getElementById("loginDivId").style.display = "block";
        //document.getElementById("loginDivId").style.width = "70%";



        document.getElementById("loginerrormsg").innerHTML = "";

        //document.getElementById("helpDisplayDivId").style.width = "30%";


        //showHelpDivMessage("Login to add or make updates to the help scan codes");

        document.getElementById("loginSecDivId").style.display = "none";
        document.getElementById("forgotPWDivId").style.display = "block";
        return;
    }

    if (LocationSearchStr.indexOf('target=') > 0) {
        var ar = LocationSearchStr.split('target=');
        pageName = ar[1];
    }

    if (LocationSearchStr.indexOf('payment_intent=') > 0) {
		document.getElementById("showCartDivId").style.display = "none";
		document.getElementById("processingPaymentDivId").style.display = "block";
		return;
    }
    var displayItem = "";
    //var displayItemNmNId = "";
    if (LocationSearchStr.indexOf('product=') > 0) {
        var ar = LocationSearchStr.split('product=');
        pageName = "product"
        displayItem = ar[1];
    }

    if (path.indexOf('product/') > 0) {
        pageName = "product";
        displayItem = path.substring(path.indexOf("product/") + 8);
    }

    if (LocationSearchStr.indexOf('mockup=') > 0) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		var item = urlParams.get("mockup");
		var front = urlParams.get("f");
		var back = urlParams.get("b");
		var color = urlParams.get("bg");
		loadMockupItem(item, front, back, color);
		return;
    }
	
    var searchItemStr = "";
    if (LocationSearchStr.indexOf('search=') > 0) {
        var ar = LocationSearchStr.split('search=');
        pageName = "home"
        searchItemStr = ar[1];
    }

    if (onMobileBrowser()) {
        //alert("On mobile")
        //showMobileMenu(pageName);

        //return;
    } else {

    }



    //document.getElementById("custommugsDivId").style.display = "none";
    //document.getElementById("HelpTopicsDivId").style.display = "none";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("howtoDivId").style.display = "none";
    document.getElementById("homeDivId").style.display = "none";

    //document.getElementById(pageName + "DivId").style.display = "block";
    //document.getElementById(pageName + "DivId").style.width = "100%";
    //document.getElementById("helpDisplayDivId").style.width = "30%";

    //document.getElementById("mainContainer").style.width = "70%";



    if (localStorage.getItem("cookieAccepted") == "y") {
        document.getElementById("cookie-div-id").style.display = "none"
    }

    var myCookie = getCookie("cookname");
    //SM: Always display cart link. Even on mobile.
    document.getElementById("cartLinkId").style.display = "block";
    if (myCookie == null) {
        sessionStorage.setItem("userLoggedIn", "n");
        if (!onMobileBrowser()) {
            //document.getElementById("loginLinkId").style.display = "block";

        }
        document.getElementById("logoutLinkId").style.display = "none";
        //document.getElementById("HelpTopicsLinkId").style.display = "none";

    } else {

        sessionStorage.setItem("userLvl", getCookie("cookuserLvl"));

        sessionStorage.setItem("userLoggedIn", "y");
        document.getElementById("loginLinkId").style.display = "none";
        document.getElementById("logoutLinkId").style.display = "block";

        //var emailid = sessionStorage.getItem("userEmail");
        //document.getElementById("usremailspanid").innerHTML = emailid + '<i class="fa fa-caret-down"></i>';

        if (sessionStorage.getItem("userLvl") == "9") {
            document.getElementById("mdaItems").style.display = "block";
            document.getElementById("mdaOrders").style.display = "block";
            document.getElementById("mdaArts").style.display = "block";
			document.getElementById("mdaMockup").style.display = "block";
			document.getElementById("add-freehand-text").style.display = "block";
			document.getElementById("add-curved-text").style.display = "block";
			
        }
        //if (sessionStorage.getItem("userLvl") == "9"){
        //	document.getElementById("HelpTopicsLinkId").style.display = "block";
        //}
    }


    var tags = JSON.parse(localStorage.getItem("itemList"));
    //if (the.itemList_LclJson == null) {
    if (tags == null) {
        //document.getElementById("loaderDivId").style.display = "block";
		document.getElementById("loaderRingDivId").style.display = "block";
        setTimeout(function() {
            //console.log("Item list is not ready yet. Will retry after 1 seconds");
            //document.getElementById("loaderDivId").style.display = "none";
			document.getElementById("loaderRingDivId").style.display = "none";
            checkURL();
        }, 1000);
        return;
    }



    //populateLanguages("helpTopics-lang-box");
    try {
        x = document.getElementById(pageName + "LinkId");
        x.className += " active";
        //x.style.display = "block";
    } catch {}

    if (pageName == "product") {

        if (canvas == undefined) {
            setTimeout(function() {
                checkURL();
            }, 100);
            return;
        }

        document.getElementById("productDivId").style.display = "block";
        //SM: 
        //document.getElementById('customItemFacing').src="/goodsandgift/img/crew_front.png";
        //document.getElementById("customItemDiv").style.backgroundImage = "url('/goodsandgift/img/crew_front.png')";
        //document.getElementById("colorSelectedLblId").innerHTML = "";
        document.getElementById("productDivId").style.width = "100%";
        //populateItemListInDropDown();
        //resizeCanvas();

        var lastItem = localStorage.getItem("curProductItem");
        if ((displayItem != "") && ((displayItem != "null"))) {
            showProduct(displayItem, "n");
        } else if (lastItem == null) {
            showProduct(the.firstIndexItemId, "n");
        } else if (lastItem == "null") {
            showProduct(the.firstIndexItemId, "n");
        } else {
            showProduct(lastItem, "n");
        }


        //document.getElementById("helpDivMessage").innerHTML = '<i class="fa fa-info-circle" style="display:none; float: left;  position: absolute; top:35px; left: 10px; color:#cc0000;" ></i>' + "Upload project files and click on the file to scan the code"
    } else if (pageName == "login") {
        //document.getElementById("productDivId").style.display = "none";
        //document.getElementById("HelpTopicsDivId").style.display = "none";
        document.getElementById("productDivId").style.display = "none";
        document.getElementById("loginDivId").style.display = "block";

        //showHelpDivMessage("Login to add or make updates to the help scan codes");
    } else if (pageName == "contactus") {
        //document.getElementById("custommugsDivId").style.display = "none";
        //document.getElementById("HelpTopicsDivId").style.display = "none";
        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "block";



        refreshCaptcha();

        //showHelpDivMessage("Contact us if you have any questions, feedback or are interested in purchasing the software. Some features have been disabled on the web version for security reasons. Full feature software can be used for software training/development, creating references and documentation for the software application. <br><br> If you found the site helpful, you can support our work by buying me a coffee by clicking on the coffee button at the top.");

    } else if (pageName == "howto"){
        document.getElementById("contactusDivId").style.display = "none";
        document.getElementById("productDivId").style.display = "none";
        document.getElementById("howtoDivId").style.display = "block";
        //document.getElementById("howtoDivId").style.width = "95%";
        //document.getElementById("mainContainer").style.width = "100%";
        //listVideos();
        

    }else if (pageName == "home") {
        document.getElementById("homeDivId").style.display = "block";
        document.getElementById("productDivId").style.display = "none";
        document.getElementById("contactusDivId").style.display = "none";
        document.getElementById("howtoDivId").style.display = "none";

        if (searchItemStr == "") {
            if (document.getElementById("cardsContainerDivId").innerHTML == "add-here"){
                populateItemList();
            }            
        } else {
            document.getElementById("searchProductTextId").value = searchItemStr;
            searchItem();
        }

    } else if (pageName == "cart") {
        Show('cart');
    }
}

function populateItemList() {
    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf);
    var innerHTML = "";
    var defaultDisplayCount = 2;
    var categoryMaxCount = 0;
    var currDisplayCount = 0;
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsandgift')) + 1);
    var categorySqueezed = ""
    

	for (var i = 0; i < rows.length; i++) {
		categorySqueezed = rows[i].category.trim();		 
		categorySqueezed = categorySqueezed.replaceAll(' ', '')
        categoryMaxCount = sessionStorage.getItem("max-count-" + rows[i].category.replaceAll(' ', '^'));
		
		var lastDisplayCnt = sessionStorage.getItem("display-count-" + rows[i].category.replaceAll(' ', '^'));
		
		if (lastDisplayCnt != null) {
			if (lastDisplayCnt != "") {
				defaultDisplayCount = lastDisplayCnt;
			}
		}
        if (i == 0) {
            innerHTML = innerHTML + '<div id="menucardparent-' + categorySqueezed + '" class="cardsContainerDivClass" style="padding-top: 70px;" > <div class="categoryHeader" ><h2 class="categoryHdrH2" >' + rows[i].category + 
			
			'</h2><label style="float: right; margin: 0px; padding: 0px" class="switch"><input style="margin: 0px;" type="checkbox" checked data-cat="'+ rows[i].category + '"  onchange="handleShowToggle(this);" ><span class="slider round"></span></label>' +
			
			'</div>';
        } else if (rows[i].category != rows[i - 1].category) {
			lastDisplayCnt = sessionStorage.getItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'));
			if (lastDisplayCnt != null) {
				if (lastDisplayCnt != "") {
					defaultDisplayCount = lastDisplayCnt;
				}
			}	
            var maxCount = 	sessionStorage.getItem("max-count-" +  rows[i - 1].category.replaceAll(' ', '^'));	
            if (parseInt(maxCount) > parseInt(defaultDisplayCount)) {
                sessionStorage.setItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'), defaultDisplayCount) ;
                
                innerHTML = innerHTML + '<div class="menucard categoryFooter ' + rows[i - 1].category.replaceAll(' ', '') + ' " >'  + 			
                '<button id="showmore-'+ rows[i - 1].category +'"  type="button" class="showmore-btn" onclick=showMoreItems("' + rows[i - 1].category.replaceAll(' ', '^') + '") >Show More</button>' +          
                '</div>';

            } else {
                sessionStorage.setItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'), currDisplayCount) ;
            }
            currDisplayCount = 0;

            innerHTML = innerHTML + '</div><div id="menucardparent-' + categorySqueezed + '" class="cardsContainerDivClass"  style="padding-top: 70px;"><div class="categoryHeader"><h2 class="categoryHdrH2" >' + rows[i].category + 
            '</h2><label style="float: right; margin: 0px; padding: 0px" class="switch"><input style="margin: 0px;" type="checkbox" checked data-cat="'+ rows[i].category + '"  onchange="handleShowToggle(this);" ><span class="slider round"></span></label>' +
            '</div>';
        }

        if (currDisplayCount >= defaultDisplayCount ){
            continue;
        }

        currDisplayCount = currDisplayCount + 1;




		
        innerHTML = innerHTML + '<div class="menucard '+ categorySqueezed +' " style="">';

        innerHTML = innerHTML + '<div class="flip-box"><div class="flip-box-inner"><div class="flip-box-front">';
        innerHTML = innerHTML + '<img src="/goodsandgift/img/' + rows[i].thumbnailimage + '" alt="Project Scan" style="width:260px; height:260px; margin: auto">';
        innerHTML = innerHTML + '</div><div class="flip-box-back"> <div style="padding: 1rem 1rem;">';
        innerHTML = innerHTML + rows[i].itemshortdesc;
        innerHTML = innerHTML + '</div></div></div></div>';

       
        innerHTML = innerHTML + '<div class="itemInfo" > <br>' + rows[i].itemname + ' (CAD ' + rows[i].price + ')<br><br>';
		
		var productURL = myUrl + "product/" + rows[i].itemname.replaceAll(' ','-') + '-'+ rows[i].itemid;

		//innerHTML = innerHTML + '<a href="?product='+ rows[i].itemname.replaceAll(' ','-') + '-'+ rows[i].itemid+'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';
		innerHTML = innerHTML + '<a href="'+ productURL +'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';
		
        if (i == rows.length - 1) {
            innerHTML = innerHTML + '</div>';
        }

    }
    if (sessionStorage.getItem("max-count-" +  rows[i - 1].category.replaceAll(' ', '^')) > defaultDisplayCount) {
        sessionStorage.setItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'), defaultDisplayCount) ;
        innerHTML = innerHTML + '<div class="menucard categoryFooter '+ categorySqueezed + ' " >'  + 			
        '<button id="showmore-"'+ rows[i - 1].category +' type="button" class="showmore-btn" onclick=showMoreItems("' + rows[i - 1].category.replaceAll(' ', '^') + '") >Show More</button>' +          
        '</div>';
    }else {
        sessionStorage.setItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'), currDisplayCount) ;
    }

    innerHTML = innerHTML + '</div>';
    document.getElementById("cardsContainerDivId").innerHTML = innerHTML;
}

function handleShowToggle (checkbox){
	var categorySqueezed = checkbox.dataset.cat;
	categorySqueezed = categorySqueezed.replaceAll(' ', '');
	
	var catCards = document.getElementsByClassName(categorySqueezed);
	
	if(checkbox.checked == false){
        //document.getElementsByClassName('appBanner')[0].style.visibility = 'hidden';	

		for (var i = 0; i < catCards.length; i ++) {
			//if (i > 1){
			catCards[i].style.display = 'none';
			//}
		}		
    }else{
		for (var i = 0; i < catCards.length; i ++) {
			//if (i > 1){
			catCards[i].style.display = 'block';
			//}
		}
	}
}


function showMoreItems(category){
	category = category.replaceAll('^', ' ')
    var showMoreDisplayCount = 6;
    var currDisplayCount = parseInt(sessionStorage.getItem("display-count-" + category.replaceAll(' ', '^')));
    var categoryMaxCount = parseInt(sessionStorage.getItem("max-count-" + category.replaceAll(' ', '^')));

    var itemName = "";
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    var categorySqueezed = ""


    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "getCategoryItems",
            category: category,
            count: currDisplayCount + showMoreDisplayCount + 1
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            rows = JSON.parse(response);

            var innerHTML = "";

            if (currDisplayCount >= categoryMaxCount){
                document.getElementById(btnId).style.display  = 'none';
                return;
            }
        
            innerHTML = innerHTML + '<div class="categoryHeader" ><h2 class="categoryHdrH2" >' + category + 
                    
            '</h2><label class="switch categoryToggleLbl"  ><input class="toggleInput"  type="checkbox" checked data-cat="'+ category + '"  onchange="handleShowToggle(this);" ><span class="slider round"></span></label>' +
           
           '</div>';
        
            for (var i = 0; i < rows.length; i++) {

                categorySqueezed = rows[i].category;		 
                categorySqueezed = categorySqueezed.replaceAll(' ', '')
        
                if (i - currDisplayCount >= showMoreDisplayCount){
                    break;
                }
        
                innerHTML = innerHTML + '<div class="menucard '+ categorySqueezed +' " style="">';

                innerHTML = innerHTML + '<div class="flip-box"><div class="flip-box-inner"><div class="flip-box-front">';
                innerHTML = innerHTML + '<img src="/goodsandgift/img/' + rows[i].thumbnailimage + '" alt="Project Scan" style="width:260px; height:260px; margin: auto">';
                innerHTML = innerHTML + '</div><div class="flip-box-back"> <div style="padding: 1rem 1rem;">';
                innerHTML = innerHTML + rows[i].itemshortdesc;
                innerHTML = innerHTML + '</div></div></div></div>';
        
         
                //innerHTML = innerHTML + '<div style=" margin: 0px; background-color:#ecf0f1 ; height: 100px; font: 14px Arial, ' + "'Brush Script MT'" + ', sans-serif; margin-top: 5px"> <br>' + rows[i].itemname + ' (CAD ' + rows[i].price + ')<br><br>';
                innerHTML = innerHTML + '<div class="itemInfo" > <br>' + rows[i].itemname + ' (CAD ' + rows[i].price + ')<br><br>';
               
                var productURL = myUrl + "product/" + rows[i].itemname.replaceAll(' ','-') + '-'+ rows[i].itemid;
               
                //innerHTML = innerHTML + '<a href="?product=' + rows[i].itemname.replaceAll(' ','-') + '-'+rows[i].itemid+'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';
                innerHTML = innerHTML + '<a href="'+ productURL +'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';
                
                if (i == rows.length - 1) {
                    innerHTML = innerHTML + '</div>';
                }
        
        
            }
        
            var btnId = "showmore-" + category ;
        
            if (i < categoryMaxCount){
                innerHTML = innerHTML + '<div class="menucard categoryFooter '+ categorySqueezed + ' " >'  + 			
                '<button id="showmore-"'+ rows[i - 1].category +' type="button" class="showmore-btn" onclick=showMoreItems("' + category.replaceAll(' ', '^') + '") >Show More</button>' +          
                '</div>';
            }
        
            var parentId = "menucardparent-" + categorySqueezed ;
        
            document.getElementById(parentId).innerHTML = innerHTML;   
        
            sessionStorage.setItem("display-count-" + rows[i - 1].category.replaceAll(' ', '^'),  i); 




        },
        error: function(xhr, status, error) {

        }
    });

}

function searchItem(event) {

    document.getElementById("homeDivId").style.display = "block";
    document.getElementById("productDivId").style.display = "none";
    document.getElementById("contactusDivId").style.display = "none";
    document.getElementById("howtoDivId").style.display = "none";

    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)


    var itemToSearchOrig = document.getElementById("searchProductTextId").value;
    

    var itemToSearch = itemToSearchOrig.trim();

    itemToSearch = itemToSearch.toUpperCase();

    var tf = JSON.parse(localStorage.getItem("itemList"));
    var rows = JSON.parse(tf).filter(function(entry) {
        var itemname = entry.itemname;
        itemname = itemname.toUpperCase();

        var category = entry.category;
        category = category.toUpperCase();

        var subcategory = entry.subcategory;
        subcategory = subcategory.toUpperCase();

        var searchtags = entry.keyword;

        if (searchtags == null) {
            searchtags = "";
        }
        searchtags = searchtags.toUpperCase();

        return itemname.includes(itemToSearch) || category.includes(itemToSearch) || subcategory.includes(itemToSearch) || searchtags.includes(itemToSearch);
    });




    var innerHTML = "";
    var rowcount = rows.length;
    //innerHTML = innerHTML + '<div class="cardsContainerDivClass" style="border: 2px solid blue;">';
    for (var i = 0; i < rowcount; i++) {
        if (i == 0) {
            innerHTML = innerHTML + '<div class="cardsContainerDivClass" > <div class="categoryHeader"><h2 class="categoryHdrH2" >' + rows[i].category + '</h2></div>';
        } else if (rows[i].category != rows[i - 1].category) {
            innerHTML = innerHTML + '</div><div class="cardsContainerDivClass" ><div class="categoryHeader"><h2 class="categoryHdrH2" >' + rows[i].category + '</h2></div>';
        }
        innerHTML = innerHTML + '<div class="menucard" style="">';

        innerHTML = innerHTML + '<div class="flip-box"><div class="flip-box-inner"><div class="flip-box-front">';
        innerHTML = innerHTML + '<img src="/goodsandgift/img/' + rows[i].thumbnailimage + '" alt="Project Scan" style="width:260px; height:260px; margin: auto">';
        innerHTML = innerHTML + '</div><div class="flip-box-back"><div style="padding: 1rem 1rem;">';
        innerHTML = innerHTML + rows[i].itemshortdesc;
        innerHTML = innerHTML + '</div></div></div></div>';

        //innerHTML = innerHTML + '<div style=" margin: 0px; background-color:#ecf0f1 ; height: 100px; font: 14px Arial, ' + "'Brush Script MT'" + ', sans-serif; margin-top: 5px"> <br>' + rows[i].itemname + ' (CAD ' + rows[i].price + ')<br><br>';
        innerHTML = innerHTML + '<div class="itemInfo" > <br>' + rows[i].itemname + ' (CAD ' + rows[i].price + ')<br><br>';
        
        var productURL = myUrl + "product/" + rows[i].itemname.replaceAll(' ','-') + '-'+ rows[i].itemid;
		
		//innerHTML = innerHTML + '<a href="?product=' + rows[i].itemname.replaceAll(' ','-') + '-'+rows[i].itemid+'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';
        innerHTML = innerHTML + '<a href="'+ productURL +'" class="aButton" style="width:150px"   >START ORDER</a></div></div>';


        if (i == rows.length - 1) {
            innerHTML = innerHTML + '</div>';
        }

    }
    innerHTML = innerHTML + '</div>';
    document.getElementById("cardsContainerDivId").innerHTML = innerHTML;
    if (itemToSearch == "") {
        document.getElementById("productSearchResultsLblDiv").style.display = "none";

    } else {
        document.getElementById("productSearchResultsLblDiv").style.display = "flex";
        if (rowcount == 0) {
            document.getElementById("productSearchResultsLbl").innerHTML = "No search results for '" + itemToSearchOrig + "'";
        } else {
            document.getElementById("productSearchResultsLbl").innerHTML = "Search results for '" + itemToSearchOrig + "'";
        }
    }

    //document.getElementById("cardsContainerDivId").style.display = "block";
    //document.getElementById("productSearchResultsLblDiv").style.display = "block";

    // Prevent the default form submission
    event.preventDefault();

}

function searchItemEntered(event) {
    if (event.keyCode === 13) {
        searchItem(event);
    }
}

function resetSearch() {
    document.getElementById("productSearchResultsLblDiv").style.display = "none";
    document.getElementById("searchProductTextId").value = "";
    populateItemList();
}

function activateAccount(pass) {

    $.ajax({
        url: '/goodsandgift/php/process.php',
        type: 'POST',
        data: jQuery.param({
            usrfunction: "activateAcc",
            passkey: pass
        }),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function(response) {
            //console.log("success");
            //console.log(response);
            if (response == "s") {
                //console.log("Account activated");
                //Show('login');


                document.getElementById("productDivId").style.display = "none";
                document.getElementById("contactusDivId").style.display = "none";
                document.getElementById("homeDivId").style.display = "none";
                document.getElementById("showCartDivId").style.display = "none";
                document.getElementById("addToCartModal").style.display = "none";
                document.getElementById("orderConfirmationDivId").style.display = "none";
                document.getElementById("showOrdersDivId").style.display = "none";
                document.getElementById("loginDivId").style.display = "block";
                //document.getElementById("loginDivId").style.width = "70%";
                document.getElementById("loginerrormsg").innerHTML = "";

                //document.getElementById("helpDisplayDivId").style.width = "30%";



                //showHelpDivMessage("Login to add or make updates to the help scan codes");

                document.getElementById("loginSecDivId").style.display = "none";
                document.getElementById("accActivatedDivId").style.display = "block";
                //markHelpCodes();

            } else {
                //console.log("Failed to activate account");
            }
        },
        error: function() {
            //console.log("Failed to activate account");
        }
    });
}

function showModal() {
    if (sessionStorage.getItem("userLoggedIn") == "y") {
        document.getElementById("checkOutDivId").style.display = "block";
        document.getElementById("checkoutusername").style.display = "none";
        //document.getElementById("checkoutemailid").value = sessionStorage.getItem("userEmail");
        document.getElementById("checkoutemailid").value = getCookie("cookname");

        //var elmnt = document.getElementById("checkoutLabel");
        //elmnt.scrollIntoView();

		const id = 'checkoutLabel';
		const yOffset = -50; 
		const element = document.getElementById(id);
		const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

		window.scrollTo({top: y, behavior: 'smooth'});

    } else {
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
    }
}

function hideModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

function hideCartModal() {
    var modal = document.getElementById("addToCartModal");
    modal.style.display = "none";
}

function checkoutWithLogin() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    //Show('login');
    document.getElementById("loginDivId").style.display = "block";
    document.getElementById("loginSecDivId").style.display = "block";
    document.getElementById("registerSecDivId").style.display = "none";
    document.getElementById("forgotPasswordSecDivId").style.display = "none";
    document.getElementById("accActivatedDivId").style.display = "none";
    document.getElementById("forgotPWDivId").style.display = "none";

    //document.getElementById("loginDivId").scrollTop = 0;
    //window.scrollTo(0, 0);
    //var elmnt = document.getElementById("loginDivId");
    //elmnt.scrollIntoView();

	const id = 'loginDivId';
	const yOffset = -50; 
	const element = document.getElementById(id);
	const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

	window.scrollTo({top: y, behavior: 'smooth'});
}

function checkoutAsGuest() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    //Show('login');
    document.getElementById("loginDivId").style.display = "none";
    document.getElementById("checkOutDivId").style.display = "block";
    
	//var elmnt = document.getElementById("checkOutDivId");
    //elmnt.scrollIntoView();
	
	const id = 'checkOutDivId';
	const yOffset = -50; 
	const element = document.getElementById(id);
	const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

	window.scrollTo({top: y, behavior: 'smooth'});	
}

function setPassword() {

    document.getElementById("newpwerrormsg").innerHTML = "<font color = #cc0000>" + " " + "</font> ";


    var StrPass = document.getElementById("newpassword").value
    var StrPassRe = document.getElementById("newpasswordRe").value

    var StrFunction = "setPassword";

    var error_message = "";


    if (StrPass.trim() == "") {
        error_message = "Please provide password with minimum 8 character length";
        document.getElementById("newpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass.length < 8) {
        error_message = "Please provide password with minimum 8 character length";
        document.getElementById("newpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass != StrPassRe) {
        error_message = "Entered passwords do not match";
        document.getElementById("newpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var resetkey = sessionStorage.getItem("passwordresetkey");

    var StrAddress = "";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usrpassword: StrPass,
            resetkey: resetkey,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'JSON',
        success: function(retstatus) {
            //alert(msg);
            //console.log(retstatus);

            if (retstatus == "S") {
                //document.getElementById("newpwerrormsg").innerHTML = "Password has been set successfully.";
                document.getElementById("setPwDivId").style.display = "none";
                document.getElementById("setPwSuccessDivId").style.display = "block";
            }

            if (retstatus == "F") {
                document.getElementById("newpwerrormsg").innerHTML = "There was a problem in completing the request. Issue has been logged and will be resolved soon. Please try again later";

            }

            if ((retstatus != "S") && (retstatus != "F")) {
                document.getElementById("newpwerrormsg").innerHTML = "<font color = red>" + retstatus + "</font> ";

            }


        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
            console.log(status);
            document.getElementById("newpwerrormsg").innerHTML = "There was a problem in completing the request. Issue has been logged and will be resolved soon. Please try again later";
        }
    });

}

function deliverySelected(method){
	var cartTotalPrice = localStorage.getItem("cartTotal");
	
	if (method == "pickup"){
		document.getElementById("paymentDiv").style.display = "block";
		document.getElementById("addresscontainerDiv").style.display = "none";
		document.getElementById("shippingDiv").style.display = "none";
		document.getElementById("addressEntered").style.display = "none";
		document.getElementById("stripePaymentId").style.display = "none";
		var shippingPrice = 0 ;
		document.getElementById("shippingPrice").innerHTML = shippingPrice;
		document.getElementById("totalPricewithShipping").innerHTML = parseFloat(cartTotalPrice) + parseFloat(shippingPrice);
		localStorage.setItem("shippingMethod", "pick up");
		
	} else if (method == "shipping"){
		document.getElementById("paymentDiv").style.display = "none";
		document.getElementById("addresscontainerDiv").style.display = "block";
		document.getElementById("shipaddrerrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
		document.getElementById("addressEntered").style.display = "none";
		document.getElementById("stripePaymentId").style.display = "none";
	}
	window.scrollTo({top:document.body.scrollHeight, behavior: 'smooth'} );
}





function refreshCaptcha() {

    let captchaText = document.querySelector('#captcha');
    var ctx = captchaText.getContext("2d");
    ctx.font = "50px arial";
    ctx.fillStyle = "#333";

    ctx.clearRect(0, 0, captchaText.width, captchaText.height);



    // alphaNums contains the characters with which you want to create the CAPTCHA
    let alphaNums = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '2', '3', '4', '5', '6', '7', '8', '9'];
    let emptyArr = [];

    // This loop generates a random string of 7 characters using alphaNums
    // Further this string is displayed as a CAPTCHA
    for (let i = 1; i <= 7; i++) {
        emptyArr.push(alphaNums[Math.floor(Math.random() * alphaNums.length)]);
    }
    var c = emptyArr.join('');
    ctx.fillText(emptyArr.join(''), captchaText.width / 10, captchaText.height / 1.8);
    the.captcha = c;
}

function refreshCaptchatwo() {

    let captchaText = document.querySelector('#captchatwo');
    var ctx = captchaText.getContext("2d");
    ctx.font = "50px Roboto";
    ctx.fillStyle = "#333";

    ctx.clearRect(0, 0, captchaText.width, captchaText.height);



    // alphaNums contains the characters with which you want to create the CAPTCHA
    let alphaNums = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '2', '3', '4', '5', '6', '7', '8', '9'];
    let emptyArr = [];

    // This loop generates a random string of 7 characters using alphaNums
    // Further this string is displayed as a CAPTCHA
    for (let i = 1; i <= 7; i++) {
        emptyArr.push(alphaNums[Math.floor(Math.random() * alphaNums.length)]);
    }
    var c = emptyArr.join('');
    ctx.fillText(emptyArr.join(''), captchaText.width / 10, captchaText.height / 1.8);
    the.captcha = c;
}


function uploadFiles(evt) {
    var files = evt.files; // FileList object


    the.uploadedFiles = files;
}

function handleFolderSelect(evt) {

    //console.log("handleFolderSelect called");

    var files = evt.files; // FileList object

    the.uploadedFiles = files;

    //Add the files list to newProjectContent variable
    //var subFolder = document.getElementById("project-sub-folder-box").value;

    for (var i = 0, f; f = files[i]; i++) {
        var str = f.webkitRelativePath;
        var pos = str.lastIndexOf("/")
        var subFolder = str.substr(0, pos);
        the.newProjectContent.push([subFolder, f.name]);
    }


    //Display the files in the output area

    var innerHTML = '<div >';

    for (var l = 0; l < the.newProjectContent.length; l++) {

        var hlpCode = the.newProjectContent[l][1];
        var hlpCdId = the.newProjectContent[l][1];
        var hlpCdGrp = the.newProjectContent[l][0];


        if (l > 0) {
            if (the.newProjectContent[l][0] != the.newProjectContent[l - 1][0]) {
                //first item in the group****Need to close previous li and open li for the new group
                innerHTML = innerHTML + '</ul> </li>';
                innerHTML = innerHTML + '<li class="day">' + '<i style = "color: black; font-style: normal; ">' + hlpCdGrp + '</i>' + ' <ul style="padding: 0; padding-left: 10px; list-style-type: none; margin: 0; ">';
                innerHTML = innerHTML + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '</li>';
            } else {
                //another item in the previous group
                innerHTML = innerHTML + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '</li>';
            }
        } else if (l == 0) {
            //First item in the list
            innerHTML = innerHTML + '<li class="day">' + '<i style = "color: black">' + hlpCdGrp + '</i>' + ' <ul style="padding: 0; padding-left: 10px; list-style-type: none; margin: 0; ">' + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '</li>';
        }

        //List is over
        if (l == the.newProjectContent.length - 1) {
            innerHTML = innerHTML + '</ul> </li></div>';
        }
    }
    document.getElementById("NewProjectStructureDisplayId").innerHTML = innerHTML;

    //SM: Added logic for help topics display


    $('li > ul').each(function(i) {
        // Find this list's parent list item.
        var parentLi = $(this).parent('li');

        // Style the list item as folder.
        parentLi.addClass('folder');

        // Temporarily remove the list from the
        // parent list item, wrap the remaining
        // text in an anchor, then reattach it.
        var subUl = $(this).remove();
        parentLi.wrapInner('<a/>').find('a').click(function() {
            // Make the anchor toggle the leaf display.
            subUl.toggle();
        });
        parentLi.append(subUl);
    });

    // Hide all lists except the outermost.
    $('ul ul').hide();



}

function handleFolderSelectTwo(evt) {

    //console.log("handleFolderSelect called");

    var files = evt.files; // FileList object

    the.uploadedFiles = files;
    the.newProjectContent = [];
    //Add the files list to newProjectContent variable
    //var subFolder = document.getElementById("project-sub-folder-box").value;

    for (var i = 0, f; f = files[i]; i++) {
        var str = f.webkitRelativePath;
        var pos = str.lastIndexOf("/")
        var subFolder = str.substr(0, pos);
        the.newProjectContent.push([subFolder, f.name]);
    }


    //Display the files in the output area

    var innerHTML = '<div style="overflow: hidden;">';

    for (var l = 0; l < the.newProjectContent.length; l++) {

        var hlpCode = the.newProjectContent[l][1];
        var hlpCdId = the.newProjectContent[l][1];
        var hlpCdGrp = the.newProjectContent[l][0];

        //if ((hlpCdGrp == null) ||(hlpCdGrp == "")){
        //	 hlpCdGrp = "Others";
        //}



        if (l > 0) {
            if (the.newProjectContent[l][0] != the.newProjectContent[l - 1][0]) {
                //first item in the group****Need to close previous li and open li for the new group
                innerHTML = innerHTML + '</ul> </li>';
                innerHTML = innerHTML + '<li class="day">' + '<i style = "color: black; font-style: normal; ">' + hlpCdGrp + '</i>' + ' <ul style="padding: 0; padding-left: 10px; list-style-type: none; margin: 0; ">';
                innerHTML = innerHTML + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '<button class="btnNewWindow" onclick="openFileInNewWindow(' + "'" + hlpCdId + "'" + ')" ></button>' + '</li>';
            } else {
                //another item in the previous group
                innerHTML = innerHTML + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '<button class="btnNewWindow" onclick="openFileInNewWindow(' + "'" + hlpCdId + "'" + ')" ></button>' + '</li>';
            }
        } else if (l == 0) {
            //First item in the list
            innerHTML = innerHTML + '<li class="day">' + '<i style = "color: black">' + hlpCdGrp + '</i>' + ' <ul style="padding: 0; padding-left: 10px; list-style-type: none; margin: 0; ">' + '<li>' + '<a href ="#" class="fileLink" onclick="fileClicked(' + "'" + hlpCdId + "'" + ');return false;" >' + hlpCode + "</a>" + '<button class="btnNewWindow" onclick="openFileInNewWindow(' + "'" + hlpCdId + "'" + ')" ></button>' + '</li>';
        }

        //List is over
        if (l == the.newProjectContent.length - 1) {
            innerHTML = innerHTML + '</ul> </li></div>';
        }
    }

    document.getElementById("NewProjectStructureDisplayIdTwo").innerHTML = innerHTML;

    //SM: Added logic for help topics display


    $('li > ul').each(function(i) {
        // Find this list's parent list item.
        var parentLi = $(this).parent('li');

        // Style the list item as folder.
        parentLi.addClass('folder');

        // Temporarily remove the list from the
        // parent list item, wrap the remaining
        // text in an anchor, then reattach it.
        var subUl = $(this).remove();
        parentLi.wrapInner('<a/>').find('a').click(function() {
            // Make the anchor toggle the leaf display.
            subUl.toggle();
        });
        parentLi.append(subUl);
    });

    // Hide all lists except the outermost.
    $('ul ul').hide();



}

function openFileInNewWindow(fileName) {
    //console.log(fileName + " is to be opened in new window");
    if (the.uploadedFiles == null) {
        return;
    }

    var files = the.uploadedFiles;

    for (var i = 0, f; f = files[i]; i++) {
        if (f.name == fileName) {
            localStorage.setItem("newWindowFileName", fileName);
            //localStorage.setItem("newWindowFileObj", JSON.stringify(f));
            //console.log(f);

            var reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem("newWindowFileObj", event.target.result);
                myUrl = window.location.protocol + "//" + window.location.host +
                    window.location.pathname + "?target=" + "custommugs";

                window.open(myUrl);
            }
            reader.readAsText(f, "UTF-8");

            //return;
        }
    }


}

function loadFile() {
    try {
        var fileName = localStorage.getItem("newWindowFileName");
        //var f = JSON.parse(localStorage.getItem("newWindowFileObj"));
        var fileData = localStorage.getItem("newWindowFileObj");
        //console.log(f);
        //Display three
        //document.getElementById("HelpTopicsDivId").style.display = "none";
        //document.getElementById("helpDisplayDivId").style.display = "block";
        if (document.getElementById("custommugsDivId").style.display == "none") {
            document.getElementById("custommugsDivId").style.display = "block";
            document.getElementById("custommugsDivId").style.width = "50%";
            document.getElementById("productDivId").style.width = "20%";
        }
        //document.getElementById("helpDisplayDivId").style.width = "30%";


        //Show("custommugs");


        var arr = fileName.split(".");
        var fileExtension = arr[1];


        var newLanguage = getLanguageForFileExtension(fileExtension);


        //var reader = new FileReader();
        //var reader = new FileReader();


        //reader.onload = function(event) {

        document.getElementById("displayFileLoaderDivId").style.display = "none";
        //console.log("File loaded");
        if (the.editor) {
            the.editor.setValue(fileData);

            the.codetext = the.editor.getValue();
        } else {
            $('#source').val(fileData);
            the.codetext = fileData;
        }
        //the.codetext = event.target.result;
        document.getElementById("selectfile").innerHTML = "<i class='fas fa-folder-open' style='font-size:20px;color:#cc0000'></i>&nbsp" + fileName;

        if (newLanguage != "") {
            the.codeLanguage = newLanguage;
            the.languageOverridden = true;
            //the.codetext = the.editor.getValue();
            //markHelpCodes();

            document.getElementById("language-box").value = newLanguage;


            markHelpCodes();

            var msg = "Code Language is " + newLanguage + " based on file extension" +
                ". If it looks incorrect, please enter the correct language in the box below and click on override button.";
            //console.log(msg)
            //document.getElementById("languageDeterminedDivId").style.display = "block";


            var gf = JSON.parse(sessionStorage.getItem("SpecialFiles"));

            var filteredRows = JSON.parse(gf).filter(function(entry) {
                var evalStr = entry.filename;
                return evalStr.toUpperCase() === fileName.toUpperCase();
            });


            if (filteredRows.length > 0) {
                //document.getElementById("filelvlhelpdivid").innerHTML = filteredRows[0].description;
                //document.getElementById("filelvlhelpdivid").style.display = "block";					
            } else {
                if (the.filelvlhelp != null) {
                    if (the.filelvlhelp != "") {
                        //document.getElementById("filelvlhelpdivid").innerHTML = the.filelvlhelp;
                        //document.getElementById("filelvlhelpdivid").style.display = "block";
                    }
                }
            }




            document.getElementById("languageOverride").style.display = "block";
            document.getElementById("overrideMsg").innerHTML = "";
            document.getElementById("helpDivMessage").style.display = "block";
            document.getElementById("helpDivMessage").innerHTML = '<i class="fa fa-info-circle" style="display:none; float: left;  position: absolute; top:35px; left: 10px; color:#cc0000;" ></i>' + cleanWord(msg, '');
            populateLanguages();

            document.getElementById("languageScanResultDivId").style.display = "none";
            document.getElementById("helpDetailsDivId").style.display = "none";
            document.getElementById("sub-tech-div-id").style.display = "none";


        } else {

            the.codeLanguage = newLanguage;
            markHelpCodes();

            document.getElementById("destinationDiv").style.display = "block";


            languageNotDeterminedMsg();


        }

        //};
        //document.getElementById("displayFileLoaderDivId").style.display = "block";
        //reader.readAsText(f, "UTF-8");
        //return;	
    } catch (err) {
        console.log(err);
    }


}


function myTopNavFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";

    } else {
        x.className = "topnav";
    }
}

function login() {
    document.getElementById("loginerrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
    StrEmail = document.getElementById("emailid").value
    StrPass = document.getElementById("password").value

    var StrRemember = "Y"

    var StrFunction = "login";

    var error_message = "";

    if (StrEmail.trim() == "") {
        error_message = "Please enter the email id";
        //document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }else if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
        error_message += "<br>Email id is not valid";
        //document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else{

		var atpos = StrEmail.indexOf("@");
		var dotpos = StrEmail.lastIndexOf(".");

		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
			error_message += "<br>Email id is not valid";
			//document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
			//return;
		}
	}

    if (StrPass.trim() == "") {
        error_message += "<br>Please provide password";
        //document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

	if (error_message != ""){
		document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		return;
	}
	
    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrpassword: StrPass,
            usrremember: StrRemember,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert("Inside login success retstatus =" + retstatus);
            //console.log( "Inside login success retstatus =" + retstatus);

            if (retstatus.substring(0, 2) == "6S") {
                document.getElementById("loginerrormsg").innerHTML = "<font color = #0000>" + "Login Successful" + "</font> "

                loggedIn = "Y";
                document.getElementById("loginLinkId").style.display = "none";
                document.getElementById("logoutLinkId").style.display = "block";
                //Show("product");

                sessionStorage.setItem("userLoggedIn", "y");
                sessionStorage.setItem("userLvl", retstatus.substring(2, 3));
                sessionStorage.setItem("userEmail", StrEmail);
				sessionStorage.setItem("StrEmail", StrEmail);
				



                //getStoredProjectList();

                if (document.getElementById("showCartDivId").style.display == "block") {
                    document.getElementById("loginDivId").style.display = "none";
                    document.getElementById("checkOutDivId").style.display = "block";
                    document.getElementById("checkoutusername").style.display = "none";
                    document.getElementById("checkoutemailid").value = StrEmail;
                    //var emailid = sessionStorage.getItem("userEmail");
                    //document.getElementById("usremailspanid").innerHTML = StrEmail + '<i class="fa fa-caret-down"></i>';

                    //var elmnt = document.getElementById("checkOutDivId");
                    //elmnt.scrollIntoView();

					const id = 'checkOutDivId';
					const yOffset = -50; 
					const element = document.getElementById(id);
					const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

					window.scrollTo({top: y, behavior: 'smooth'});
                } else {

                    var myUrl = window.location.protocol + "//" + window.location.host +
                        window.location.pathname;

                    window.open(myUrl + "?target=" + "home", "_self");
                }


                //document.getElementById("addNewProjBtnId").style.display = "block";
                //sessionStorage.setItem("userLoggedIn", "y");

            } else {
                document.getElementById("loginerrormsg").innerHTML = "<font color = #cc0000>" + retstatus + "</font> ";
            }
        },
        error: function(xhr, status, error) {
            //alert(xhr);
            console.log(error);
            console.log(xhr);
        }
    });
}
function editShippingAddress(){
	document.getElementById("addressEntered").style.display = "none";
	document.getElementById("addresscontainerDiv").style.display = "block";
	document.getElementById("shippingDiv").style.display = "none";
	document.getElementById("paymentDiv").style.display = "none";
}

function shippingSelected(method){
	var tags = JSON.parse(localStorage.getItem("shippingmethods"));
	var cartTotalPrice = localStorage.getItem("cartTotal");
	var shippingPrice = 0;
	
	for (var i = 0; i < tags.length; i++) {
		bubblemail = tags[i].bubblemail;
		regular = tags[i].regular;
		express = tags[i].express;
		flatratebx = tags[i].flatratebx;
		regular_days = tags[i].regular_days;
		express_days = tags[i].express_days;
		
		
		if (method == "bubblemail"){
			//the.shippingMethod = "bubblemail CAD " + bubblemail;
			localStorage.setItem("shippingMethod", "bubblemail CAD " + bubblemail);
			shippingPrice = bubblemail ;
			document.getElementById("shippingPrice").innerHTML = shippingPrice;
			document.getElementById("totalPricewithShipping").innerHTML = parseFloat(cartTotalPrice) + parseFloat(shippingPrice);
			if ((cartTotalPrice + shippingPrice) > 0 ){
				document.getElementById("displayPaymentTotal").style.display = "flex";
				document.getElementById("paymentDiv").style.display = "block";
				
			}
		}else if (method == "regular"){
			//the.shippingMethod = "regular CAD " + regular;
			localStorage.setItem("shippingMethod", "regular CAD " + regular);
			shippingPrice = regular ;
			document.getElementById("shippingPrice").innerHTML = shippingPrice;
			document.getElementById("totalPricewithShipping").innerHTML = parseFloat(cartTotalPrice) + parseFloat(shippingPrice);;			
			if ((cartTotalPrice + shippingPrice) > 0 ){
				document.getElementById("displayPaymentTotal").style.display = "flex";
				document.getElementById("paymentDiv").style.display = "block";
				
			}
		}else if (method == "flatratebx"){
			//the.shippingMethod = "flatratebx CAD " + flatratebx;
			localStorage.setItem("shippingMethod", "flatratebx CAD " + flatratebx);
			shippingPrice = flatratebx ;
			document.getElementById("shippingPrice").innerHTML = shippingPrice;	
			document.getElementById("totalPricewithShipping").innerHTML = parseFloat(cartTotalPrice) + parseFloat(shippingPrice);;
			if ((cartTotalPrice + shippingPrice) > 0 ){
				document.getElementById("displayPaymentTotal").style.display = "flex";
				document.getElementById("paymentDiv").style.display = "block";
				
			}
		}
		//window.scrollTo(0,document.body.scrollHeight );
		window.scrollTo({top:document.body.scrollHeight, behavior: 'smooth'} );

	}

}
function getShippingCost(){
    document.getElementById("shipaddrerrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
	document.getElementById("placeordererrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
	var error_message = "";
    userName = document.getElementById("checkoutusername").value;
	StrEmail = document.getElementById("checkoutemailid").value;
	
    if (sessionStorage.getItem("userLoggedIn") == "n") {
        if (userName.trim() == "") {
            error_message = "Please enter your name";
            //document.getElementById("shipaddrerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            //return;
        }
    } else {
        userName = getCookie("cookFLname");
    }
	
	userName = userName.replaceAll("+"," ");
	//if (userName.includes("+")){
	//	userName = userName.replaceAll("+"," ");
	//}


    if (StrEmail.trim() == "") {
        error_message += "<br>Please enter the email id";
        //document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message += "<br>Email id is not valid";
        //document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else {

		var atpos = StrEmail.indexOf("@");
		var dotpos = StrEmail.lastIndexOf(".");

		if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
			error_message += "<br>Email id is not valid";
			//document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
			//return;
		}
	}


	
	shipaddress = document.getElementById("shipaddress").value;
    shipcountry = document.getElementById("shipcountry").value;
	zipcode = document.getElementById("zipcode").value;
	zipcode = zipcode.replaceAll(' ', '');
	shipcity = document.getElementById("shipcity").value;
	shipstate = document.getElementById("shipstate").value;
	

	if ((shipaddress.trim() == "") || (shipcountry.trim() == "") || (zipcode.trim() == "") || (shipcity.trim() == "") || (shipstate.trim() == "")) {
		error_message += "<br>All address fields are required";
		//document.getElementById("shipaddrerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		//return;
	}

	if (error_message != ""){
		document.getElementById("shipaddrerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		return;
	}
	
	document.getElementById("addressEntered").innerHTML = "<button  type='button' class='btn btn-secondary' onclick=editShippingAddress() >Edit</button><br>" + userName + "<br>" + shipaddress + "<br>" + shipcity + "," + shipstate + "<br> ZIP code - " + zipcode + "<br>" + shipcountry.toUpperCase()
	
	var cart = localStorage.getItem("shoppingCart");
    var StrFunction = "getShippingCosts";

    var error_message = "";

	document.getElementById("loaderRingDivId").style.display = "block";
    document.body.style.cursor='wait';
	
    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            zipcode: zipcode,
            cart: cart,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(response) {
			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";
            localStorage.setItem("shippingmethods", JSON.stringify(response));

            var innerHTML = "<br><label>Shipping</label><hr style='margin-top: 0px'>";
			var tags = response ;
			//tags = JSON.parse(response);

			var bubblemail = "";
			var regular = "";
			
			var express = "";


			var flatratebx = "";
			var regular_days = "";
			var express_days = "";
			
			for (var i = 0; i < tags.length; i++) {
				bubblemail = tags[i].bubblemail;
				regular = tags[i].regular;
				express = tags[i].express;
				flatratebx = tags[i].flatratebx;
				regular_days = tags[i].regular_days;
				express_days = tags[i].express_days;
				
				
				if (bubblemail != 0){
					if ((bubblemail > 1.5) && (bubblemail < 20)){
						innerHTML = innerHTML + "<div class='shippingOptionsDiv'><input class='checkOutRadioBtn' type='radio' name='shipping' onclick='shippingSelected(" +'"'+ "bubblemail" + '"'+ ")'> Economy Envelope (No tracking) - CAD " + bubblemail +"</div>"
					}
				}
				if (flatratebx > 0){
					if (regular < flatratebx){
						if ((regular > 10) && (regular < 200)){
							innerHTML = innerHTML + "<div class='shippingOptionsDiv'><input class='checkOutRadioBtn' type='radio' name='shipping' onclick='shippingSelected(" +'"'+ "regular" + '"'+ ")'> Standard Shipping - CAD " + regular +"</div>"
						}
					} else if (flatratebx >= regular){
						if ((flatratebx > 10) && (flatratebx < 200)){
							innerHTML = innerHTML + "<div class='shippingOptionsDiv'><input class='checkOutRadioBtn' class='checkOutRadioBtn' type='radio' name='shipping' onclick='shippingSelected(" +'"'+ "flatratebx" + '"'+ ")'> Standard Shipping - CAD " + flatratebx +"</div>"
						}
					}
				} else {
					if (regular > 10){
						innerHTML = innerHTML + "<div class='shippingOptionsDiv'><input class='checkOutRadioBtn' type='radio' name='shipping' onclick='shippingSelected(" +'"'+ "regular" + '"'+ ")'> Standard Shipping - CAD " + regular +"</div>"
					}

				}
				
				
				document.getElementById("shippingDiv").innerHTML = innerHTML;
				document.getElementById("shippingDiv").style.display = "block";
				document.getElementById("addressEntered").style.display = "block";
				document.getElementById("addresscontainerDiv").style.display = "none";
			}


        },
        error: function(xhr, status, error) {
			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";
            //document.getElementById("loaderDivId").style.display = "none";
            document.getElementById("shipaddrerrormsg").innerHTML = "<font color = #cc0000>" + "Sorry the provided postal code is not served by our shipping partner" + "</font> ";
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });
	
}

function placeOrder(stripePaymentIntent) {

	//sessionStorage.getItem("totalPricewithShipping");
	var orderNote = sessionStorage.getItem("orderNote");
	var StrEmail = sessionStorage.getItem("StrEmail");
	var userName = sessionStorage.getItem("userName");
	var deliveryaddress = sessionStorage.getItem("shipaddress") + "&#013;&#010;" +
		sessionStorage.getItem("shipcity")+ ", " +
		sessionStorage.getItem("shipstate")+ " " +
		sessionStorage.getItem("zipcode") + "&#013;&#010;" +
		sessionStorage.getItem("shipcountry");
		 
		
		

    var paymentMethod = "";
	var stripeCustomerID = "";
	var deliverymethod = localStorage.getItem("shippingMethod");
	
	if (deliverymethod == "pick up"){
		deliveryaddress = "";
	}
    var StrFunction = "PlaceOrder";

    var error_message = "";

    var usrLoggedIn = sessionStorage.getItem("userLoggedIn");
    var cart = localStorage.getItem("shoppingCart");
	if ((cart == "") || (cart == "[]")){
			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);
	
			document.body.style.cursor='default';
            //document.getElementById("loaderDivId").style.display = "none";
            document.getElementById("orderResponseDivId").innerHTML = "<font color = #cc0000>" + "Sorry. The request could not be processed. " + "</font> ";
			document.getElementById("processingPaymentDivId").style.display = "none";
			document.getElementById("showCartDivId").style.display = "none";
			document.getElementById("orderConfirmationDivId").style.display = "block";
		return;
	}
    //var cartTotal = localStorage.getItem("cartTotal");
	var cartTotal = sessionStorage.getItem("totalPricewithShipping");
    //var orderNote = document.getElementById("chechout-msg").value;
    //document.getElementById("loaderDivId").style.display = "block";
	document.getElementById("loaderRingDivId").style.display = "block";
    document.body.style.cursor='wait';
	
    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrLoggedIn: usrLoggedIn,
            cart: cart,
            cartTotal: cartTotal,
            orderNote: orderNote,
            userName: userName,
            paymentMethod: paymentMethod,
            deliverymethod: deliverymethod,
			deliveryaddress: deliveryaddress,
			stripeCustomerID: stripeCustomerID,
			stripePaymentIntent: stripePaymentIntent,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {

			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);

			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";
            //document.getElementById("loaderDivId").style.display = "none";
            //alert("Inside login success retstatus =" + retstatus);
            //console.log( "Inside login success retstatus =" + retstatus);
            
			//document.getElementById("paymentAmountId").innerHTML = localStorage.getItem("cartTotal");;
            
			localStorage.setItem("shoppingCart", "");
            clearCart();
            document.getElementById("orderNbrId").innerHTML = retstatus + ". We will send the updates regarding your order to the provided email id " + sessionStorage.getItem("StrEmail");
            //document.getElementById("interacSec").innerHTML = retstatus;
            localStorage.setItem("orderList", null);
            localStorage.setItem("itemList", null);
            getItemList();
			document.getElementById("processingPaymentDivId").style.display = "none";
            document.getElementById("orderConfirmationDivId").style.display = "block";
            document.getElementById("showCartDivId").style.display = "none";




			var myCookie = getCookie("cookname");

			if (myCookie == null) {
				sessionStorage.setItem("userLoggedIn", "n");
				document.getElementById("logoutLinkId").style.display = "none";
			} else {

				sessionStorage.setItem("userLvl", getCookie("cookuserLvl"));
				sessionStorage.setItem("userLoggedIn", "y");
				document.getElementById("loginLinkId").style.display = "none";
				document.getElementById("logoutLinkId").style.display = "block";

				if (sessionStorage.getItem("userLvl") == "9") {
					document.getElementById("mdaItems").style.display = "block";
					document.getElementById("mdaOrders").style.display = "block";
					document.getElementById("mdaArts").style.display = "block";
					document.getElementById("mdaMockup").style.display = "block";
					document.getElementById("add-freehand-text").style.display = "block";
					document.getElementById("add-curved-text").style.display = "block";
				}

			}



            //displayCart();

        },
        error: function(xhr, status, error) {
			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);
	
			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";
            //document.getElementById("loaderDivId").style.display = "none";
            document.getElementById("orderResponseDivId").innerHTML = "<font color = #cc0000>" + "Sorry. We could not process the order. Any charges to your payment method will be reverted." + "</font> ";
			document.getElementById("processingPaymentDivId").style.display = "none";
			document.getElementById("showCartDivId").style.display = "none";
			document.getElementById("orderConfirmationDivId").style.display = "block";


			var myCookie = getCookie("cookname");

			if (myCookie == null) {
				sessionStorage.setItem("userLoggedIn", "n");
				document.getElementById("logoutLinkId").style.display = "none";
			} else {

				sessionStorage.setItem("userLvl", getCookie("cookuserLvl"));
				sessionStorage.setItem("userLoggedIn", "y");
				document.getElementById("loginLinkId").style.display = "none";
				document.getElementById("logoutLinkId").style.display = "block";

				if (sessionStorage.getItem("userLvl") == "9") {
					document.getElementById("mdaItems").style.display = "block";
					document.getElementById("mdaOrders").style.display = "block";
					document.getElementById("mdaMockup").style.display = "block";
					document.getElementById("mdaArts").style.display = "block";
					document.getElementById("add-freehand-text").style.display = "block";
					document.getElementById("add-curved-text").style.display = "block";					
				}

			}
	
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });

}

function saveMockUp() {

	//sessionStorage.getItem("totalPricewithShipping");
	var orderNote = "Mockup";
	var StrEmail = "Mockup";
	var userName = "Mockup";
	var deliveryaddress = "Mockup";
	var stripePaymentIntent = "Mockup";
		
		

    var paymentMethod = "";
	var stripeCustomerID = "";
	var deliverymethod = "Mockup";
	

    var StrFunction = "PlaceOrder";

    var error_message = "";

    var usrLoggedIn = sessionStorage.getItem("userLoggedIn");
    var cart = localStorage.getItem("shoppingCart");
	if ((cart == "") || (cart == "[]")){
			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);
	
			document.body.style.cursor='default';
 			alert("The request could not be processed. Please ensure that item is added to cart before placing mock up order");
 			//document.getElementById("processingPaymentDivId").style.display = "none";
			//document.getElementById("showCartDivId").style.display = "none";
			//document.getElementById("orderConfirmationDivId").style.display = "block";
		return;
	}
    //var cartTotal = localStorage.getItem("cartTotal");
	var cartTotal = sessionStorage.getItem("totalPricewithShipping");
    //var orderNote = document.getElementById("chechout-msg").value;
    //document.getElementById("loaderDivId").style.display = "block";
	document.getElementById("loaderRingDivId").style.display = "block";
    document.body.style.cursor='wait';
	
    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrLoggedIn: usrLoggedIn,
            cart: cart,
            cartTotal: cartTotal,
            orderNote: orderNote,
            userName: userName,
            paymentMethod: paymentMethod,
            deliverymethod: deliverymethod,
			deliveryaddress: deliveryaddress,
			stripeCustomerID: stripeCustomerID,
			stripePaymentIntent: stripePaymentIntent,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {

			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);

			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";

            
			//localStorage.setItem("shoppingCart", "");
            //clearCart();
            //document.getElementById("orderNbrId").innerHTML = retstatus + ". This mock up can be accessed from " + myUrl + "/?mockup=" + retstatus;
			alert("This mock up can be accessed from " + myUrl + "?mockup=" + retstatus);
            //localStorage.setItem("orderList", null);
            //localStorage.setItem("itemList", null);
            //getItemList();
			document.getElementById("processingPaymentDivId").style.display = "none";
            //document.getElementById("orderConfirmationDivId").style.display = "block";
            document.getElementById("showCartDivId").style.display = "none";




			var myCookie = getCookie("cookname");

			if (myCookie == null) {
				sessionStorage.setItem("userLoggedIn", "n");
				document.getElementById("logoutLinkId").style.display = "none";
			} else {

				sessionStorage.setItem("userLvl", getCookie("cookuserLvl"));
				sessionStorage.setItem("userLoggedIn", "y");
				document.getElementById("loginLinkId").style.display = "none";
				document.getElementById("logoutLinkId").style.display = "block";

				if (sessionStorage.getItem("userLvl") == "9") {
					document.getElementById("mdaItems").style.display = "block";
					document.getElementById("mdaOrders").style.display = "block";
					document.getElementById("mdaArts").style.display = "block";
					document.getElementById("mdaMockup").style.display = "block";
					document.getElementById("add-freehand-text").style.display = "block";
					document.getElementById("add-curved-text").style.display = "block";
				}

			}



            //displayCart();

        },
        error: function(xhr, status, error) {
			myUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

			const nextURL = myUrl;
			const nextTitle = 'Goods and Gift';
			const nextState = {
				additionalInformation: 'Updated the URL with JS'
			};

			// This will create a new entry in the browser's history, without reloading
			window.history.pushState(nextState, nextTitle, nextURL);
	
			document.body.style.cursor='default';
			document.getElementById("loaderRingDivId").style.display = "none";
            //document.getElementById("loaderDivId").style.display = "none";
            document.getElementById("orderResponseDivId").innerHTML = "<font color = #cc0000>" + "Sorry. Mock up request could not be placed." + "</font> ";
			document.getElementById("processingPaymentDivId").style.display = "none";
			document.getElementById("showCartDivId").style.display = "none";
			document.getElementById("orderConfirmationDivId").style.display = "block";


			var myCookie = getCookie("cookname");

			if (myCookie == null) {
				sessionStorage.setItem("userLoggedIn", "n");
				document.getElementById("logoutLinkId").style.display = "none";
			} else {

				sessionStorage.setItem("userLvl", getCookie("cookuserLvl"));
				sessionStorage.setItem("userLoggedIn", "y");
				document.getElementById("loginLinkId").style.display = "none";
				document.getElementById("logoutLinkId").style.display = "block";

				if (sessionStorage.getItem("userLvl") == "9") {
					document.getElementById("mdaItems").style.display = "block";
					document.getElementById("mdaOrders").style.display = "block";
					document.getElementById("mdaMockup").style.display = "block";
					document.getElementById("mdaArts").style.display = "block";
					document.getElementById("add-freehand-text").style.display = "block";
					document.getElementById("add-curved-text").style.display = "block";					
				}

			}
	
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });

}

function updateOrder(orderid, sendEmail) {
    document.getElementById("updateordererrormsg-" + orderid).innerHTML = "<font color = red>" + " " + "</font> ";

    var usremail = sessionStorage.getItem("userEmail");
    var customeremail = document.getElementById("customeremail-" + orderid).value;
    var customername = document.getElementById("customername-" + orderid).value;
    var paymentamountreceived = document.getElementById("paymentamountreceived-" + orderid).value;
    var paymentmethod = document.getElementById("paymentmethod-" + orderid).value;
    var paymentdate = document.getElementById("paymentdate-" + orderid).value;
    var orderstatus = document.getElementById("orderstatus-" + orderid).value;
    var orderstatusupdatenotes = document.getElementById("orderstatusupdatenotes-" + orderid).value;
	var deliveryaddress = document.getElementById("deliveryaddress-" + orderid).value;

    /*
    if (sendEmail == "y"){
    	var orderstatusUpr = orderstatus.toUpperCase();
    	if (orderstatusUpr.includes("READY")){			
    	} else {
    		sendEmail = "n";
    	}
    }
    */

    if (sessionStorage.getItem("userLoggedIn") == "n") {

        error_message = "Not authorized";
        document.getElementById("updateordererrormsg-" + orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;

    } else if (sessionStorage.getItem("userLvl") != "9") {
        error_message = "Not authorized";
        document.getElementById("updateordererrormsg-" + orderid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var StrFunction = "UpdateOrder";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: usremail,
            orderid: orderid,
            customeremail: customeremail,
            customername: customername,
            paymentamountreceived: paymentamountreceived,
            paymentmethod: paymentmethod,
            paymentdate: paymentdate,
            orderstatus: orderstatus,
            orderstatusupdatenotes: orderstatusupdatenotes,
            sendEmail: sendEmail,
			deliveryaddress: deliveryaddress,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert("Inside login success retstatus =" + retstatus);
            //console.log( "Inside updateOrder success retstatus =" + retstatus);
            localStorage.setItem("mdaOrderList", null);
            document.getElementById("updateordererrormsg-" + orderid).innerHTML = "<font color = #cc0000>" + "Updated successfully" + "</font> ";

            //displayCart();

        },
        error: function(xhr, status, error) {
            document.getElementById("updateordererrormsg-" + orderid).innerHTML = "<font color = #cc0000>" + "Failed to update" + "</font> ";
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });
}

function updateItem(itemid, createNewItem) {

    var usremail = sessionStorage.getItem("userEmail");

    var itemname = "(New Item) Please Edit";
    var currentlyoffered = "0";
    var price = "10";
	
	var shipbubble = "10";
	var shipreg = "10";
	var shipexped = "10";
	var shippriority = "10";
	var shipweightkg = 1;
	
    var category = "";
    var subcategory = "";

    var thumbnailimage = "";
    var keyword = "";

    var hasmultipleimages = "0";

    var itemimage = "Provide";
    var itemdesc = "Provide";
    var itemshortdesc = "Provide";
    var masteritemid = "";
    var itemsortorderid = "";
    var categorysortorderid = "";
	var vinyltype = "";

    var quantityinitial = "0";
    var quantitiesremaining = "0";
    var allowcustomtext = "0";
    var allowcustomnote = "1";

    var allowcustomimage = "0";
    var allowaddart = "0";
    var coloroptions = "";
    var questionforaddnote = "";
    var userinputsrequired = "";
    var cridesignsizefactor = "";
    var canvasfrontstring = "";
    var canvasbackstring = "";

    if (itemid == "" && createNewItem == "y") {
        if (sessionStorage.getItem("userLoggedIn") == "n") {

            error_message = "Not authorized";
            return;

        } else if (sessionStorage.getItem("userLvl") != "9") {
            error_message = "Not authorized";
            return;
        }


    } else {
        document.getElementById("updateitemerrormsg-" + itemid).innerHTML = "<font color = red>" + " " + "</font> ";

        itemname = document.getElementById("itemname-" + itemid).value;
        itemdesc = document.getElementById("itemdesc-" + itemid).value;
        itemshortdesc = document.getElementById("itemshortdesc-" + itemid).value;

        masteritemid = document.getElementById("masteritemid-" + itemid).value;
        itemsortorderid = document.getElementById("itemsortorderid-" + itemid).value;
        categorysortorderid = document.getElementById("categorysortorderid-" + itemid).value;
		vinyltype = document.getElementById("vinyltype-" + itemid).value;
		
        currentlyoffered = document.getElementById("currentlyoffered-" + itemid).value;
        price = document.getElementById("price-" + itemid).value;
		
		shipbubble = document.getElementById("shipbubble-" + itemid).value;
		shipreg = document.getElementById("shipreg-" + itemid).value;
		shipexped = document.getElementById("shipexped-" + itemid).value;
		shippriority = document.getElementById("shippriority-" + itemid).value;
		shipweightkg = document.getElementById("shipweightkg-" + itemid).value;
        category = document.getElementById("category-" + itemid).value;
        subcategory = document.getElementById("subcategory-" + itemid).value;

        thumbnailimage = document.getElementById("thumbnailimage-" + itemid).value;
        keyword = document.getElementById("keyword-" + itemid).value;

        hasmultipleimages = document.getElementById("hasmultipleimages-" + itemid).value;

        itemimage = document.getElementById("image-" + itemid).value;
        quantityinitial = document.getElementById("quantityinitial-" + itemid).value;
        quantitiesremaining = document.getElementById("quantitiesremaining-" + itemid).value;
        allowcustomtext = document.getElementById("allowcustomtext-" + itemid).value;
        allowcustomnote = document.getElementById("allowcustomnote-" + itemid).value;

        allowaddart = document.getElementById("allowaddart-" + itemid).value;
        allowcustomimage = document.getElementById("allowcustomimage-" + itemid).value;
        coloroptions = document.getElementById("coloroptions-" + itemid).value;
        questionforaddnote = document.getElementById("questionforaddnote-" + itemid).value;
        userinputsrequired = document.getElementById("userinputsrequired-" + itemid).value;
        cridesignsizefactor = document.getElementById("cridesignsizefactor-" + itemid).value;
        canvasfrontstring = document.getElementById("canvasfrontstring-" + itemid).value;
        canvasbackstring = document.getElementById("canvasbackstring-" + itemid).value;

        if (sessionStorage.getItem("userLoggedIn") == "n") {

            error_message = "Not authorized";
            document.getElementById("updateitemerrormsg-" + itemid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            return;

        } else if (sessionStorage.getItem("userLvl") != "9") {
            error_message = "Not authorized";
            document.getElementById("updateitemerrormsg-" + itemid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            return;
        }
    }
    var StrFunction = "UpdateItem";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: usremail,
            itemid: itemid,
            itemname: itemname,
            itemdesc: itemdesc,
            itemshortdesc: itemshortdesc,
            masteritemid: masteritemid,
            itemsortorderid: itemsortorderid,
            categorysortorderid: categorysortorderid,
			vinyltype: vinyltype,
            currentlyoffered: currentlyoffered,
            price: price,
			shipbubble: shipbubble,
			shipreg: shipreg,
			shipexped: shipexped,
			shippriority: shippriority,	
			shipweightkg: shipweightkg,
            category: category,
            subcategory: subcategory,
            thumbnailimage: thumbnailimage,
            keyword: keyword,
            hasmultipleimages: hasmultipleimages,
            itemimage: itemimage,
            quantityinitial: quantityinitial,
            quantitiesremaining: quantitiesremaining,
            allowcustomtext: allowcustomtext,
            allowcustomnote: allowcustomnote,
            allowaddart: allowaddart,
            allowcustomimage: allowcustomimage,
            coloroptions: coloroptions,
            questionforaddnote: questionforaddnote,
            userinputsrequired: userinputsrequired,
            createNewItem: createNewItem,
            cridesignsizefactor: cridesignsizefactor,
            canvasfrontstring: canvasfrontstring,
            canvasbackstring: canvasbackstring,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert("Inside login success retstatus =" + retstatus);
            //console.log( "Inside updateItem success retstatus =" + retstatus);
            localStorage.setItem("mdaItemList", null);
            //localStorage.setItem("itemList", null);
            getItemList();
            if (itemid == "") {
                showMdaItems();
            } else {
                document.getElementById("updateitemerrormsg-" + itemid).innerHTML = "<font color = #cc0000>" + "Processed successfully" + "</font> ";
            }
            //displayCart();

        },
        error: function(xhr, status, error) {
            if (!itemid == "") {
                document.getElementById("updateitemerrormsg-" + itemid).innerHTML = "<font color = #cc0000>" + "Failed to update" + "</font> ";
            }
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });
}

function updateArt(imageid, createNewArtItem) {

    var usremail = sessionStorage.getItem("userEmail");

    var imagedisplayname = "(New Item) Please Edit";
    var imageoffered = "0";
    var imagecategory = "";
    var imagesubcategory = "";
    var imagefilename = "";
    var additionalinfo = "";

    if (imageid == "" && createNewArtItem == "y") {
        if (sessionStorage.getItem("userLoggedIn") == "n") {

            error_message = "Not authorized";
            return;

        } else if (sessionStorage.getItem("userLvl") != "9") {
            error_message = "Not authorized";
            return;
        }


    } else {
        document.getElementById("imagefilename-ererrormsg-" + imageid).innerHTML = "<font color = red>" + " " + "</font> ";

        imagedisplayname = document.getElementById("imagedisplayname-" + imageid).value;
        imagefilename = document.getElementById("imagefilename-" + imageid).value;

        imagefilename = imagefilename.trim();
        imagefilename = imagefilename.toLowerCase();

        if (!imagefilename.includes(".png")) {
            imagefilename = imagefilename + ".png";
        }

        imageoffered = document.getElementById("imageoffered-" + imageid).value;
        imagecategory = document.getElementById("imagecategory-" + imageid).value;
        imagesubcategory = document.getElementById("imagesubcategory-" + imageid).value;
        additionalinfo = document.getElementById("additionalinfo-" + imageid).value;


        if (sessionStorage.getItem("userLoggedIn") == "n") {

            error_message = "Not authorized";
            document.getElementById("imagefilename-ererrormsg-" + imageid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            return;

        } else if (sessionStorage.getItem("userLvl") != "9") {
            error_message = "Not authorized";
            document.getElementById("imagefilename-ererrormsg-" + imageid).innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            return;
        }
    }
    var StrFunction = "UpdateArtItem";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: usremail,
            imagedisplayname: imagedisplayname,
            imageoffered: imageoffered,
            imagecategory: imagecategory,
            imagesubcategory: imagesubcategory,
            additionalinfo: additionalinfo,
            imagefilename: imagefilename,
            imageid: imageid,

            createNewArtItem: createNewArtItem,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert("Inside login success retstatus =" + retstatus);
            //console.log( "Inside updateArtItem success retstatus =" + retstatus);
            localStorage.setItem("artList", null);
            //getArtList();
            if (imageid == "") {

                getMdaArtList();
                //showMdaArts();
            } else {
                document.getElementById("imagefilename-ererrormsg-" + imageid).innerHTML = "<font color = #cc0000>" + "Processed successfully" + "</font> ";
            }
            //displayCart();

        },
        error: function(xhr, status, error) {
            if (!imageid == "") {
                document.getElementById("imagefilename-ererrormsg-" + imageid).innerHTML = "<font color = #cc0000>" + "Failed to update" + "</font> ";
            }
            //alert(xhr);

            //console.log(error);
            //console.log(xhr);
        }
    });
}


function loginWithoutRefresh() {
    document.getElementById("Subloginerrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
    StrEmail = document.getElementById("Subemailid").value
    StrPass = document.getElementById("Subpassword").value

    var StrRemember = "Y"

    var StrFunction = "login";

    var error_message = "";

    if (StrEmail.trim() == "") {
        error_message = "Please enter the email id";
        document.getElementById("Subloginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var atpos = StrEmail.indexOf("@");
    var dotpos = StrEmail.lastIndexOf(".");

    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
        error_message = "Email id is not valid";
        document.getElementById("Subloginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message = "Email id is not valid";
        document.getElementById("Subloginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass.trim() == "") {
        error_message = "Please provide password";
        document.getElementById("Subloginerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrpassword: StrPass,
            usrremember: StrRemember,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert(substr(retstatus,4));
            //alert("Inside login loginWithoutRefresh retstatus =" + retstatus);
            //console.log( "Inside loginWithoutRefresh success retstatus =" + retstatus);
            if (retstatus.substring(0, 2) == "6S") {
                //document.getElementById("Subloginerrormsg").innerHTML = "Login Successful"

                loggedIn = "Y";
                document.getElementById("loginLinkId").style.display = "none";
                document.getElementById("SubloginDivId").style.display = "none";
                document.getElementById("logoutLinkId").style.display = "block";
                document.getElementById("helpAddUpdateMsg").innerHTML = "";
                //Show("product");

                sessionStorage.setItem("userLoggedIn", "y");
                sessionStorage.setItem("userLvl", retstatus.substring(2, 3));

            } else {
                document.getElementById("Subloginerrormsg").innerHTML = "<font color = #cc0000>" + retstatus + "</font> ";
            }
        },
        error: function(xhr, status, error) {
            alert(xhr);
            console.log(error);
            console.log(xhr);
        }
    });
}

function SubshowCreateAccount() {
    document.getElementById("SubloginSecDivId").style.display = "none"
    document.getElementById("SubregisterSecDivId").style.display = "block"
}

function SubshowLogin() {
    document.getElementById("SubregisterSecDivId").style.display = "none"
    document.getElementById("SubloginSecDivId").style.display = "block"
}

function Logout() {
    StrFunction = "logout";
    error_message = "";
    localStorage.setItem("mdaItemList", null);
    localStorage.setItem("curProductItem", null);
    localStorage.setItem("itemList", null);
    localStorage.setItem("coloreditem", null);
    sessionStorage.setItem("userLvl", null);
    //localStorage.setItem("itemList", null);
    localStorage.setItem("artList", null);
    localStorage.setItem("orderList", null);
    localStorage.setItem("mdaItemList", null);
    localStorage.setItem("shoppingCart", "");
    clearCart();
    localStorage.setItem("cartTotal", null);

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert(substr(retstatus,4));

            if (retstatus == "S") {
                loggedIn = "N";
                if (!onMobileBrowser()) {
                    document.getElementById("loginLinkId").style.display = "block";
                }
                document.getElementById("logoutLinkId").style.display = "none";
                sessionStorage.setItem("userLoggedIn", "n");
                sessionStorage.setItem("SavedProjectsList", null);
				
				setCookie("cookname", null, -1)
				
                //Show("product");
                var myUrl = window.location.protocol + "//" + window.location.host +
                    window.location.pathname;

                window.open(myUrl + "?target=" + "home", "_self");
            } else {
                //console.log(retstatus);	
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}



function cookieAccepted() {
    document.getElementById("cookie-div-id").style.display = "none"
    localStorage.setItem("cookieAccepted", "y");
}

function register() {

    document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + " " + "</font> ";

    var StrEmail = document.getElementById("registeremailid").value
    var StrName = document.getElementById("registerusname").value
    var StrPass = document.getElementById("registerpassword").value
    var StrPassRe = document.getElementById("registerpasswordre").value

    var StrFunction = "register";

    var error_message = "";

    if (StrName.trim() == "") {
        error_message = "Please provide your name";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

    if (StrEmail.trim() == "") {
        error_message += "<br>Please enter the email id";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message += "<br>Email id is not valid";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else {
		var atpos = StrEmail.indexOf("@");
		var dotpos = StrEmail.lastIndexOf(".");

		if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
			error_message += "<br>Email id is not valid";
			//document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
			//return;
		}
	}


    if (StrPass.trim() == "") {
        error_message += "<br>Please provide password with minimum 8 character length";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else  if (StrPass.length < 8) {
        error_message += "<br>Please provide password with minimum 8 character length";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

    if (StrPass != StrPassRe) {
        error_message += "<br>Entered passwords do not match";
        //document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

	if (error_message != ""){
		document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		return;
	}

    var StrAddress = "";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrpassword: StrPass,
            usrfullname: StrName,
            usraddress: StrAddress,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'JSON',
        success: function(retstatus) {
            //alert(msg);
            //console.log(retstatus);

            if (retstatus == "S") {
                document.getElementById("registererrormsg").innerHTML = "<font color = #29ABE0>" + "Registration completed successfully. You should receive an email shortly to activate the account." + "</font> ";
            }

            if (retstatus == "F") {
                document.getElementById("registererrormsg").innerHTML = "There was a problem in completing registration. Issue has been logged and will be resolved soon. Please try again later";

            }

            if ((retstatus != "S") && (retstatus != "F")) {
                document.getElementById("registererrormsg").innerHTML = "<font color = #cc0000>" + retstatus + "</font> ";

            }


        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
            console.log(status);
            document.getElementById("registererrormsg").innerHTML = "There was a problem in completing registration. Issue has been logged and will be resolved soon. Please try again later";
        }
    });
}

function showToast(msg) {

    document.getElementById("snackbar").innerHTML = msg;
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function() {
        x.className = x.className.replace("show", "");
    }, 3000);
}

function Subregister() {
    document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + " " + "</font> ";

    var StrEmail = document.getElementById("Subregisteremailid").value
    var StrName = document.getElementById("Subregisterusname").value
    var StrPass = document.getElementById("Subregisterpassword").value
    var StrPassRe = document.getElementById("Subregisterpasswordre").value

    var StrFunction = "register";

    var error_message = "";

    if (StrName.trim() == "") {
        error_message = "Please provide your name";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrEmail.trim() == "") {
        error_message = "Please enter the email id";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var atpos = StrEmail.indexOf("@");
    var dotpos = StrEmail.lastIndexOf(".");

    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
        error_message = "Email id is not valid";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message = "Email id is not valid";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass.trim() == "") {
        error_message = "Please provide password with minimum 8 character length";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass.length < 8) {
        error_message = "Please provide password with minimum 8 character length";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (StrPass != StrPassRe) {
        error_message = "Entered passwords do not match";
        document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var StrAddress = "";

    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrpassword: StrPass,
            usrfullname: StrName,
            usraddress: StrAddress,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'JSON',
        success: function(retstatus) {
            //alert(msg);
            //console.log(retstatus);

            if (retstatus == "S") {
                document.getElementById("Subregistererrormsg").innerHTML = "<font color = #0000>" + "Registration completed successfully. Please check your email for account activation." + "</font> ";
            }

            if (retstatus == "F") {
                document.getElementById("Subregistererrormsg").innerHTML = "There was a problem in completing registration. Issue has been logged and will be resolved soon. Please try again later";

            }

            if ((retstatus != "S") && (retstatus != "F")) {
                document.getElementById("Subregistererrormsg").innerHTML = "<font color = #cc0000>" + retstatus + "</font> ";

            }


        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
            console.log(status);
            document.getElementById("Subregistererrormsg").innerHTML = "There was a problem in completing registration. Issue has been logged and will be resolved soon. Please try again later";
        }
    });
}

function forgotpw() {
    document.getElementById("forgotpwerrormsg").innerHTML = "<font color = #cc0000>" + " " + "</font> ";

    var StrEmail = document.getElementById("forgotpwemailid").value

    var StrFunction = "forgotpw";

    var error_message = "";


    if (StrEmail.trim() == "") {
        error_message = "Please enter the email id";
        document.getElementById("forgotpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    var atpos = StrEmail.indexOf("@");
    var dotpos = StrEmail.lastIndexOf(".");

    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
        error_message = "Email id is not valid";
        document.getElementById("forgotpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message = "Email id is not valid";
        document.getElementById("forgotpwerrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        return;
    }


    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usremail: StrEmail,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'JSON',
        success: function(retstatus) {
            //alert(msg);
            //console.log(retstatus);

            if (retstatus == "S") {
                document.getElementById("forgotpwerrormsg").innerHTML = "<font color = #0000>" + "Request processed. You should receive an email shortly with password reset link." + "</font> ";
            }

            if (retstatus == "F") {
                document.getElementById("forgotpwerrormsg").innerHTML = "Email id not found";

            }

            if ((retstatus != "S") && (retstatus != "F")) {
                document.getElementById("forgotpwerrormsg").innerHTML = "<font color = red>" + retstatus + "</font> ";

            }


        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
            console.log(status);
            document.getElementById("forgotpwerrormsg").innerHTML = "There was a problem in completing the request. Issue has been logged and will be resolved soon. Please try again later";
        }
    });
}
function goToHome(){
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    myUrl = myUrl +"?target=home";

    window.location.href = myUrl;    
}

function goToContactUs(){
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    myUrl = myUrl +"?target=contactus";

    window.location.href = myUrl;    
}

function goToCart(){
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    myUrl = myUrl +"?target=cart";

    window.location.href = myUrl;    
}

function goToHowTo(){
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    myUrl = myUrl +"?target=howto";

    window.location.href = myUrl; 

    //document.getElementById("howtoDivId").style.display = "block";
}

function goToLogin(){
    var path = window.location.pathname;
    var myUrl = path.substring(0, path.indexOf('/',path.indexOf('goodsand')) + 1)
    myUrl = myUrl +"?target=login";

    window.location.href = myUrl;    
}


function contactus() {
    document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + " " + "</font> ";
    var StrEmail = document.getElementById("contactusemailid").value
    var StrName = document.getElementById("contactusname").value
    var StrComment = document.getElementById("contactus_msg").value

    var StrFunction = "contactus";

    var error_message = "";

    if (StrName.trim() == "") {
        error_message += "Please provide your name";
        //document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

    if (StrEmail.trim() == "") {
        error_message += "<br>Please enter the email id";
        //document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message += "<br>Email id is not valid";
        //document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    } else {

		var atpos = StrEmail.indexOf("@");
		var dotpos = StrEmail.lastIndexOf(".");

		if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
			error_message += "<br>Email id is not valid";
			//document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
			//return;
		}
	}
    



    if (StrComment.trim() == "") {
        error_message += "<br>Please provide message";
        //document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }

    if (the.captcha != document.getElementById("enteredCaptchaText").value) {
        if ((sessionStorage.getItem("userLoggedIn") == "n") || (sessionStorage.getItem("userLvl") != "9")) {
            error_message += "<br>Please enter displayed code in the box";
            //document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            //return;
        }
    }
	
	if (error_message != ""){
		document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		return;
	}
    $.ajax({
        url: '/goodsandgift/php/process.php',
        data: {
            usrname: StrName,
            usremail: StrEmail,
            usrcomment: StrComment,
            usrfunction: StrFunction
        },
        type: 'POST',
        dataType: 'json',
        success: function(retstatus) {
            //alert(substr(retstatus,4));
            //console.log(retstatus);
            document.getElementById("contactuserrormsg").innerHTML = "<font color = #0000>" + "Thank you for your message. We will get back to you shortly" + "</font> ";

            /*
            if (retstatus == "S"){
            	document.getElementById("contactuserrormsg").innerHTML = "<font color = #cc0000>" + "Thank you for your message. We will get back to you shortly" + "</font> ";
            }
            else
            {
              document.getElementById("MainHead").innerHTML = "<font color = blue face = 'arial'> There was a problem sending message. Issue has been logged and will be resolved soon. Please try again later</font> <br> <br><br> <input type='button' class='button_type1'  value='Ok' onclick='CANCLCRTACC()'> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br>";				
            }
            */
        },
        error: function(xhr, status, error) {
            console.log(error);
            console.log(xhr);
        }
    });
}

function onMobileBrowser() {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // true for mobile device
        return true;
    } else {
        // false for not mobile device
        return false;
    }


}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function logCommon(msg) {
    //console.log("At " + new Date().toLocaleString() + " from common-functions.js " + msg )
}