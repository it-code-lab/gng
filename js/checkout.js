// Get API Key
let STRIPE_PUBLISHABLE_KEY = document.currentScript.getAttribute('STRIPE_PUBLISHABLE_KEY');

// Create an instance of the Stripe object and set your publishable API key
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

let elements; // Define card elements
const paymentFrm = document.querySelector("#paymentFrm"); // Select payment form element

// Get payment_intent_client_secret param from URL
const clientSecretParam = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
);

// Check whether the payment_intent_client_secret is already exist in the URL
setProcessing(true);

function processPayment(){

    document.getElementById("placeordererrormsg").innerHTML = "<font color = red>" + " " + "</font> ";
    StrEmail = document.getElementById("checkoutemailid").value;

    userName = document.getElementById("checkoutusername").value;
	
	var error_message = "";
	
    if (sessionStorage.getItem("userLoggedIn") == "n") {
        if (userName.trim() == "") {
            error_message = "Please enter name";
            //document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
            //return;
        }
    } else {
        userName = getCookie("cookFLname");
    }
    userName = userName.replaceAll("+"," ");

    if (StrEmail.trim() == "") {
        error_message += "<br>Please enter the email id";
        //document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }else     if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(StrEmail))) {
        error_message += "<br>Email id is not valid";
        //document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
        //return;
    }else {

		var atpos = StrEmail.indexOf("@");
		var dotpos = StrEmail.lastIndexOf(".");

		if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= StrEmail.length) {
			error_message += "<br>Email id is not valid";
			//document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
			//return;
		}
	}


	if (error_message != ""){
		document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
		return;
	}

	StrEmail = StrEmail.replaceAll("'","''");
	sessionStorage.setItem("StrEmail", StrEmail);
	
	userName = userName.replaceAll("'","''");
	sessionStorage.setItem("userName", userName);

	if(!clientSecretParam){
		setProcessing(false);
		
		// Create an instance of the Elements UI library and attach the client secret
		initialize();
		
	} else {

		error_message = "Failed to process";
		document.getElementById("placeordererrormsg").innerHTML = "<font color = #cc0000>" + error_message + "</font> ";
	}
}

// Check the PaymentIntent creation status
checkStatus();

// Attach an event handler to payment form
paymentFrm.addEventListener("submit", handleSubmit);

// Fetch a payment intent and capture the client secret
let payment_intent_id;


async function initialize() {
	
	let itemPrice = document.getElementById("totalPricewithShipping").innerHTML;
	var orderNote = document.getElementById("chechout-msg").value;
/*    
	var StrEmail = document.getElementById("checkoutemailid").value;
    var userName = document.getElementById("checkoutusername").value;
    if (sessionStorage.getItem("userLoggedIn") == "n") {

    } else {
        userName = getCookie("cookFLname");
    }
	userName = userName.replaceAll("+"," ");
*/
	var shipaddress = document.getElementById("shipaddress").value;
    var shipcountry = document.getElementById("shipcountry").value;
	var zipcode = document.getElementById("zipcode").value;
	zipcode = zipcode.replaceAll(' ', '');
	var shipcity = document.getElementById("shipcity").value;
	var shipstate = document.getElementById("shipstate").value;
	
	sessionStorage.setItem("totalPricewithShipping", itemPrice);
	
	orderNote = orderNote.replaceAll("'","''");
	sessionStorage.setItem("orderNote", orderNote);

/*	
	StrEmail = StrEmail.replaceAll("'","''");
	sessionStorage.setItem("StrEmail", StrEmail);
	
	userName = userName.replaceAll("'","''");
	sessionStorage.setItem("userName", userName);
*/	
	shipaddress = shipaddress.replaceAll("'","''");
	sessionStorage.setItem("shipaddress", shipaddress);
	
	shipcountry = shipcountry.replaceAll("'","''");
	sessionStorage.setItem("shipcountry", shipcountry);
	
	zipcode = zipcode.replaceAll("'","''");
	sessionStorage.setItem("zipcode", zipcode);
	
	shipcity = shipcity.replaceAll("'","''");
	sessionStorage.setItem("shipcity", shipcity);
	
	shipstate = shipstate.replaceAll("'","''");
	sessionStorage.setItem("shipstate", shipstate);
	document.getElementById("loaderRingDivId").style.display = "block";
	
	//alert(itemPrice);
    const { id, clientSecret } = await fetch("/goodsandgift/php/payment_init.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_type:'create_payment_intent' , itemPrice: itemPrice  }),
    }).then((r) => r.json());
	
    const appearance = {
        theme: 'stripe',
        rules: {
            '.Label': {
                fontWeight: 'normal',
				fontSize: '10px',
                textTransform: 'uppercase',
            }
        }
    };
	
    elements = stripe.elements({ clientSecret, appearance });
	
    const paymentElement = elements.create("payment");
    paymentElement.mount("#paymentElement");
	
    payment_intent_id = id;
	document.body.style.cursor='wait';
	document.getElementById("loaderRingDivId").style.display = "block";
	setTimeout(function() {
		document.getElementById("stripePaymentId").style.display = "block";
	}, 1000);
	setTimeout(function() {		
		window.scrollTo({top:document.body.scrollHeight, behavior: 'smooth'} );
		document.body.style.cursor='default';
		document.getElementById("loaderRingDivId").style.display = "none";
	}, 1100);	
	//window.scrollTo(0,document.body.scrollHeight);
	
}

// Card form submit handler
async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
	
    let customer_name = sessionStorage.getItem("userName");
	customer_name = customer_name.replaceAll("'","''");
	
    let customer_email = document.getElementById("checkoutemailid").value;
	customer_email = customer_email.replaceAll("'","''");
	

    const { id, customer_id } = await fetch("/goodsandgift/php/payment_init.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_type:'create_customer', payment_intent_id: payment_intent_id, name: customer_name, email: customer_email }),
    }).then((r) => r.json());
	
	
    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page
			
			//*****SM: TODO********************
            //return_url: window.location.href+'?customer_id='+customer_id,
			return_url: window.location.href,
        },
	});
	
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occured.");
    }
	
    setLoading(false);
}

// Fetch the PaymentIntent status after payment submission
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );
	
    const customerID = new URLSearchParams(window.location.search).get(
        "customer_id"
    );
	
    if (!clientSecret) {
        return;
    }
	
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
	
    if (paymentIntent) {
        switch (paymentIntent.status) { 
            case "succeeded":
				//Show('cart');
				placeOrder(paymentIntent );
                //showMessage("Payment succeeded!");
				
                // Post the transaction info to the server-side script and redirect to the payment status page
				
/*				
                fetch("/goodsandgift/php/payment_init.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ request_type:'payment_insert', payment_intent: paymentIntent, customer_id: customerID }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.payment_id) {
                        transErr = 0;
                        
						
						//window.location.href = '/goodsandgift/php/payment-status.php?pid='+data.payment_id;
                    } else {
                        showMessage(data.error);
                        setReinit();
                    }
                })
                .catch(console.error);
*/				
                break;
            case "processing":
                showMessage("Your payment is processing.");
                setReinit();
                break;
            case "requires_payment_method":
                showMessage("Your payment was not successful, please try again.");
                setReinit();
                break;
            default:
                showMessage("Something went wrong.");
                setReinit();
                break;
        }
    } else {
        showMessage("Something went wrong.");
        setReinit();
    }
}


// Display message
function showMessage(messageText) {
    const messageContainer = document.querySelector("#paymentResponse");
	
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;
	
    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageText.textContent = "";
    }, 5000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submitBtn").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#buttonText").classList.add("hidden");
    } else {
        // Enable the button and hide spinner
        document.querySelector("#submitBtn").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#buttonText").classList.remove("hidden");
    }
}

// Show a spinner on payment form processing
function setProcessing(isProcessing) {
    if (isProcessing) {
        paymentFrm.classList.add("hidden");
        document.querySelector("#frmProcess").classList.remove("hidden");
    } else {
        paymentFrm.classList.remove("hidden");
        document.querySelector("#frmProcess").classList.add("hidden");
    }
}

// Show payment re-initiate button
function setReinit() {
    document.querySelector("#frmProcess").classList.add("hidden");
    document.querySelector("#payReinit").classList.remove("hidden");
}