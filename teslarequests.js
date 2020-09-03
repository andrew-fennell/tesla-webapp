// primary info
var vehicle_name = document.getElementById('name');
var state = document.getElementById('currentState');

var odometer = document.getElementById('odometer');
var sentry = document.getElementById('sentry');

var model = document.getElementById('model');
var version = document.getElementById('version');

// secondary info
var insideTemperature = document.getElementById('insideTemp');
var insideTemperatureClimate = document.getElementById('insideTempClimate');
var outsideTemperatureClimate = document.getElementById('outsideTempClimate');
var mapStatus = document.getElementById('mapStatus');
var acOnOff = document.getElementById('ac-on-off');
var acOnOff2 = document.getElementById('ac-on-off2');
var climateControls = document.getElementById('climateControls');
var range = document.getElementById('range');
var chargeState = document.getElementById('chargeState');
var chargeRate = document.getElementById('chargeRate');
var remaining = document.getElementById('remaining');



// tertiary info
var last_action = document.getElementById('last_action');
var last_action2 = document.getElementById('last_action2');
var last_updated = document.getElementById('last_updated');
var connectionStatus = document.getElementById('connectionStatus');
var vehicleImg = document.getElementById('vehicleImg');
var vehicleImg2 = document.getElementById('vehicleImg2');

// primary variables
let vehicle_id = -1;
let current_state = -1;
let sentryMode = -1;
let display_name = "Tesla";
let vehicleModel = -1;
let vehicleVersion = -1;
let odometer_miles = -1;

let inside_temp = -1;
let outside_temp = -1;
let current_lat = -1;
let current_lng = -1;
let map_status = -1;
let climate_mode = -1;
let currentRange = -1;
let currentChargeState = -1;
let currentRate = -1;
let timeRemaining = -1;
let door_state = -1;
let auth_token = -1;

let car_type = -1;
let wheel_type = -1;
let exterior_color = -1;


let loaded = 0;

let login_info = {
    email: "",
    password: "",
    client_id: "81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384",
    client_secret: "c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3"
}

// buttons
var lockUnlock = $('.lock-unlock');

function showPassword() {
    var x = document.getElementById("pass");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
}

function showPage() {
    $('#app-wrapper').removeClass('hidden');
    $('.login-container').addClass('screen-wipe');
    $('#app-wrapper').addClass('screenWipeUpFromBottom');

    setTimeout(function() { $('.login-container').addClass('hidden'); $('.login-container').removeClass('screen-wipe'); $('#app-wrapper').removeClass('screenWipeUpFromBottom'); }, 1000);
}

function wipeDown() {
    $('.body').addClass('login-overflow');
    $('#climateControl-wrapper').addClass('hidden');
    $('#app-wrapper').removeClass('hidden');
    $('#app-wrapper').addClass('screenWipeDown');

    setTimeout(function() { $('#app-wrapper').removeClass('screenWipeDown'); }, 1000);
}

function openClimateControls() {
    $('#app-wrapper').addClass('hidden');
    $('#climateControl-wrapper').removeClass('hidden'); 
    $('#climateControl-wrapper').addClass('screenWipeUpFromBottom');
    $('.body').addClass('login-overflow');

    setTimeout(function() {  $('#climateControl-wrapper').removeClass('screenWipeUpFromBottom'); $('.body').removeClass('login-overflow'); }, 1200);
}

function getFormData() {
    var user = document.getElementById('user');
    var entered_user = "";
    var pass = document.getElementById('pass');
    var entered_pass = "";

    entered_user = user.value;
    entered_pass = pass.value;

    user.innerText = "";
    pass.innerText = "";

    login_info["email"] = entered_user;
    login_info["password"] = entered_pass;

    connectionStatus.innerText = 'Connecting to vehicle';

    if (entered_user == "admin" && entered_pass == "pass") {
        showFake();
        showPage();
    }

    getAuthToken();
    
    let count = 0;

    var vehicleConnecting = setInterval(function() { 
        console.log('connecting...'); 
        count = count + 1;
        if (auth_token != -1) {
            connectVehicle(auth_token);
            connectionStatus.innerText = 'Vehicle connected.';
            clearInterval(vehicleConnecting);
        }

        if (count == 20) {
            clearInterval(vehicleConnecting);
        }
    }, 500);
    
    setTimeout(function() {
        if (count < 20) {
            clearInterval(vehicleConnecting);
        } else {
            connectionStatus.innerText = 'Could not connect to vehicle\nPlease check your login credentials.';
            clearInterval(vehicleConnecting);
        }
    }, 10000);

    count = 0;

    while (true) {
        count = count + 1;
        if (vehicle_id != -1) {
            showPage();
        }

        setTimeout(function() { return; }, 500);

        if (count == 10) {
            break;
        }
    }

    if (count == 40) {
        connectionStatus.innerText = 'Vehicle connection failed...';
    }
}

function getAuthToken() {
    let Url = `https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/oauth/token?grant_type=password&client_id=${login_info["client_id"]}&client_secret=${login_info["client_secret"]}&email=${login_info["email"]}&password=${login_info["password"]}`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8"
            },
            type: "POST",
            success: function(result){
                auth_token = result["access_token"];
            },
            error:function(error){
                console.log(`Error ${error}`)
            }
        })
}

$(document).ready(function(){

    if (document.location.href.split('.html')[0].split('/').pop() == 'index' && 
    document.location.href.split('index.html?').pop().split('=')[0] == 'auth') {

        auth_token = document.location.href.split('?').pop().split('&')[0].split('=').pop();

        showPage();
        connectVehicle(auth_token);

    }

    $('#climateControls').click(function() {
        openClimateControls();
    })

    $("#ac-on-off").click(function() {
        toggleAC();
    })

    $("#ac-on-off2").click(function() {
        toggleAC();
    })

    $(".back-main").click(function() {
        wipeDown();
    })

    $('.honkhorn').click(function() {
        Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/honk_horn`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "POST",
            success: function(result){
                console.log(`${vehicle_id}'s horn honked.`);
                last_action.innerText = `${display_name}'s horn honked.`
            },
            error:function(error){
                console.log(`Error ${error}`)
            }
        })

    })

    $('.frunk').click(function() {
        let confirmed = confirm(`Are you sure you want to remotely open ${display_name}'s frunk?`);
        if (confirmed) {
            Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/actuate_trunk`;
            $.ajax({
				traditional: true,
                url: Url,
                headers: {
                    "content-type":"application/json; charset=UTF-8",
                    "Authorization":`Bearer ${auth_token}`
                },
				data: JSON.stringify({ 
					'which_trunk': 'front',
				}),
                type: "Post",
                success: function(result){
					console.log(result);
                    console.log(`${vehicle_id}'s frunk opened.`);
                    last_action.innerText = `${display_name}'s frunk opened.`;
                },
                error:function(error){
                    console.log(`Error ${error}`)
                }
            })
        }
    })

    $('.boot').click(function() {
        var confirmed = confirm(`Are you sure you want to remotely open ${display_name}'s trunk?`);
        if (confirmed) {
            Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/actuate_trunk?which_trunk=rear`;
            $.ajax({
				traditional: true,
                url: Url,
                headers: {
                    "content-type":"application/json; charset=UTF-8",
                    "Authorization":`Bearer ${auth_token}`
                },
				data: JSON.stringify({ 
					'which_trunk': 'rear',
				}),
                type: "Post",
                success: function(result){
                    console.log(`${vehicle_id}'s trunk opened.`);
                    last_action.innerText = `${display_name}'s trunk opened.`;
                },
                error:function(error){
                    console.log(`Error ${error}`);
                }
            })
        }
    })

    $('.lock-unlock').click(function() {
        if (door_state == "locked") {
            lockUnlock.toggleClass('fa-lock');
            lockUnlock.toggleClass('fa-unlock');
            Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/door_unlock`;
            $.ajax({
                url: Url,
                headers: {
                    "content-type":"application/json; charset=UTF-8",
                    "Authorization":`Bearer ${auth_token}`
                },
                type: "Post",
                success: function(result){
                    console.log(`${vehicle_id}'s doors unlocked.`);
                    last_action.innerText = `${display_name}'s doors unlocked.`;
                },
                error:function(error){
                    console.log(`Error ${error}`);
                }
            })

            door_state = "unlocked";
        } else {

            lockUnlock.toggleClass('fa-lock');
            lockUnlock.toggleClass('fa-unlock');
            Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/door_lock`;
            $.ajax({
                url: Url,
                headers: {
                    "content-type":"application/json; charset=UTF-8",
                    "Authorization":`Bearer ${auth_token}`
                },
                type: "Post",
                success: function(result){
                    console.log(`${vehicle_id}'s doors locked.`);
                    last_action.innerText = `${display_name}'s doors locked.`
                },
                error:function(error){
                    console.log(`Error ${error}`)
                }
            })
            door_state = "locked";
        }
    })

    

    $('.getInfo').click(function() {
        getInfo(auth_token);
    })

    $('.location').click(function() {
        Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/vehicle_data`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "GET",
            success: function(result){
                console.log(result);

                current_lat = result["response"]["drive_state"]["latitude"];
                current_lng = result["response"]["drive_state"]["longitude"];

                window.location.href = `map.html?auth=${auth_token}&vehicle_id=${vehicle_id}`;
                
            },
            error:function(error){
                console.log(`Error ${error}`);
                window.location.href = `map.html`;
            }
        })
    })

    $('.back').click(function() {
        window.location.href = `index.html?auth=${auth_token}&vehicle_id=${vehicle_id}`;
    })

    $('.updateLocation').click(function() {
        updateMap(vehicle_id);
    })

    $('.flashlights').click(function() {
        Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/flash_lights`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "Post",
            success: function(result){
                console.log(`${vehicle_id}'s lights flashed.`);
                last_action.innerText = `${display_name}'s lights flashed.`;
            },
            error:function(error){
                console.log(`Error ${error}`);
            }
        })
    })
})

// Initialize and add the map
function initMap(latitude = 37.4925, longitude = -121.94462) {
    // The location of Uluru
    var uluru = {lat: latitude, lng: longitude};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 18, center: uluru});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: uluru, map: map});
}


function connectVehicle(token) {
    Url='https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles';
    $.ajax({
        url: Url,
        headers: {
            "content-type":"application/json; charset=UTF-8",
            "Authorization":`Bearer ${token}`
        },
        type: "GET",
        success: function(result){
            vehicle_id = result["response"]["0"]["id_s"];
            display_name = result["response"]["0"]["display_name"];
            current_state = result["response"]["0"]["state"];
            
            if (current_state == 'online') {
                setTimeout(function() { getInfo(token); }, 1000);
                console.log(`${display_name} is ${current_state}.`);
            } else if (current_state == 'asleep') {
                Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/wake_up`;
                $.ajax({
                    url: Url,
                    headers: {
                        "content-type":"application/json; charset=UTF-8",
                        "Authorization":`Bearer ${token}`
                    },
                    type: "POST",
                    success: function(result){
                        console.log(`${vehicle_id} is now awake`);
                        connectVehicle(token);
                    },
                    error:function(error){
                        console.log(`Error ${error}`)
                    }
                })
            } else {
                Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/wake_up`;
                $.ajax({
                    url: Url,
                    headers: {
                        "content-type":"application/json; charset=UTF-8",
                        "Authorization":`Bearer ${token}`
                    },
                    type: "POST",
                    success: function(result){
                        console.log(`${vehicle_id} is now awake`);
                        connectVehicle(token);
                    },
                    error:function(error){
                        console.log(`Error ${error}`)
                    }
                })
            }
        },
        error:function(error){
            console.log(`Error ${error}`)
        }
    })

    return vehicle_id;
}

function updateMap(vehicle_id) {
    vehicle_id = document.location.href.split('&')[1].split('=').pop();

    mapStatus.innerText = `Finding...`;
    let new_lat = -1;
    let new_lng = -1;
    let current_time = -1;

    Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/vehicle_data`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "GET",
            success: function(result){
                console.log(result);
                new_lat = result["response"]["drive_state"]["latitude"];
                new_lng = result["response"]["drive_state"]["longitude"];

                initMap(new_lat, new_lng);
                current_time = getCurrentTime();
                mapStatus.innerText = `Map updated to show vehicle's location. (${current_time})`;
            },
            error:function(error){
                console.log(`Error ${error}`)
                console.log('Map update failed');
            }
        })
}

function onloadMapUpdate() {
    mapStatus.innerText = "Map initiated.";

    auth_token = document.location.href.split('&')[0].split('=').pop();
    vehicle_id = connectVehicle(auth_token);
    setTimeout(function(){ updateMap(vehicle_id) }, 2000);
}

function getCurrentTime() {
    var n = new Date(new Date().getTime() + 4*60*60).toLocaleTimeString();
    return n;
}

function getInfo(token) {
    Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/vehicle_data`;
    $.ajax({
        url: Url,
        headers: {
            "content-type":"application/json; charset=UTF-8",
            "Authorization":`Bearer ${token}`
        },
        type: "GET",
        success: function(result){
            console.log(result);
            let range_units = -1;
            let range_units_time = -1;
            let temp_units = -1;

            if (result["response"]["gui_settings"]["gui_charge_rate_units"] == "mi/hr") {
                range_units = "miles"
                range_units_time = "mi/hr"
            } else {
                range_units = "km"
                range_units_time = "km/hr"
            }

            if (result["response"]["gui_settings"]["gui_temperature_units"] == "F") {
                temp_units = "°F";
            } else {
                temp_units = "°C";
            }

            vehicle_id = result["response"]["id_s"];
            display_name = result["response"]["display_name"];
            if (document.location.href.split('/').pop().split('?')[0] != "map.html") {
                document.location.href.split('/').pop().split('?')[0];
                vehicle_name.innerText = display_name;

                current_state = result["response"]["state"];
                state.innerText = current_state;

                car_type = result["response"]["vehicle_config"]["car_type"];
                wheel_type = result["response"]["vehicle_config"]["wheel_type"];
                exterior_color = result["response"]["vehicle_config"]["exterior_color"];

                vehicleImg.src = `./img/${car_type}/${wheel_type}/${exterior_color}.png`;
                vehicleImg2.src = `./img/${car_type}/${wheel_type}/${exterior_color}.png`;

                inside_temp = result["response"]["climate_state"]["inside_temp"];
                inside_temp = (inside_temp * 9 / 5) + 32;
                insideTemperature.innerText = Math.round(inside_temp) + " " + temp_units;
                insideTemperatureClimate.innerText = Math.round(inside_temp) + " " + temp_units;

                outside_temp = result["response"]["climate_state"]["outside_temp"];
                outside_temp = (outside_temp * 9 / 5) + 32;
                outsideTemperatureClimate.innerText = Math.round(outside_temp) + " " + temp_units;

                odometer_miles = result["response"]["vehicle_state"]["odometer"];
                odometer_miles = Math.round(odometer_miles);
                odometer.innerText = odometer_miles + " miles";

                climate_mode = result["response"]["climate_state"]["is_climate_on"];
                if (climate_mode) {
                    climate_mode = "On";
                    acOnOff.innerHTML = "<img src='img/Climate-On.png'>"
                } else {
                    climate_mode = "Off";
                    acOnOff.innerHTML = "<img src='img/Climate-Off.png'>"
                }

                currentRange = Math.round(result["response"]["charge_state"]["battery_range"]) + " " + range_units + " (" + result["response"]["charge_state"]["battery_level"] + "%)";
                range.innerText = currentRange;

                currentChargeState = result["response"]["charge_state"]["charging_state"];
                chargeState.innerText = currentChargeState;

                currentRate = result["response"]["charge_state"]["charge_rate"] + " " + range_units_time;
                chargeRate.innerText = currentRate;

                timeRemaining = result["response"]["charge_state"]["time_to_full_charge"];
                if (timeRemaining) {
                    let hours = timeRemaining - (timeRemaining % 1);
                    let minutes = Math.round((timeRemaining % 1) * 60);
                    timeRemaining = `${hours} hr ${minutes} min`;

                    remaining.innerText = timeRemaining;
                }

                vehicleModel = result["response"]["vehicle_config"]["car_type"].split("model")[1];
                model.innerText = vehicleModel;

                vehicleVersion = result["response"]["vehicle_state"]["car_version"].split(" ")[0];
                version.innerText = vehicleVersion;

                sentryMode = result["response"]["vehicle_state"]["sentry_mode"];
                if (sentryMode) {
                    sentryMode = "Online";
                } else {
                    sentryMode = "Offline"
                }
                sentry.innerText = sentryMode;

                door_state = result["response"]["vehicle_state"]["locked"];
                lockUnlock.toggleClass('fa-lock');
                if (door_state) {
                    door_state = "locked";
                    lockUnlock.addClass('fa-lock');
                } else {
                    door_state = "unlocked";
                    lockUnlock.addClass('fa-unlock');
                }

                if (loaded == 0) {
                    showPage();
                    loaded = 1;
                } 
            }

            current_time = getCurrentTime();
            last_updated.innerText = `${current_time}`;
        },
        error:function(error){
            console.log(`Error ${error}`)
        }
    })
}


function toggleAC() {
    if (climate_mode == 'Off') {
        Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/auto_conditioning_start`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "Post",
            success: function(result){
                climate_mode = "On";
                console.log(`${vehicle_id}'s air conditioning turned ${climate_mode}`);
                last_action.innerText = `${display_name}'s air conditioning turned ${climate_mode}`;
                last_action2.innerText = `${display_name}'s air conditioning turned ${climate_mode}`;
                acOnOff.innerHTML = "<img src='img/Climate-On.png'>";
                acOnOff2.innerHTML = "<img src='img/Climate-On.png'>";
                $(acOnOff).addClass('on');
                $(acOnOff2).addClass('on');
            },
            error:function(error){
                console.log(`Error ${error}`);
            }
        })
    } else {
        Url=`https://cors-anywhere.herokuapp.com/https://owner-api.teslamotors.com/api/1/vehicles/${vehicle_id}/command/auto_conditioning_stop`;
        $.ajax({
            url: Url,
            headers: {
                "content-type":"application/json; charset=UTF-8",
                "Authorization":`Bearer ${auth_token}`
            },
            type: "Post",
            success: function(result){
                climate_mode = "Off";
                console.log(`${vehicle_id}'s air conditioning turned ${climate_mode}`);
                last_action.innerText = `${display_name}'s air conditioning turned ${climate_mode}`;
                last_action2.innerText = `${display_name}'s air conditioning turned ${climate_mode}`;
                acOnOff.innerHTML = "<img src='img/Climate-Off.png'>";
                acOnOff2.innerHTML = "<img src='img/Climate-Off.png'>";
                $(acOnOff).removeClass('on');
                $(acOnOff2).removeClass('on');
            },
            error:function(error){
                console.log(`Error ${error}`);
            }
        })
    }

        
}

function showFake() {
    last_action.innerHTML = "<h2 style='margin-bottom: 0px; border-bottom: none;'>This is a preview version of this web application.<h2>"

    let range_units = -1;
    let range_units_time = -1;
    let temp_units = -1;

    range_units = "miles"
    range_units_time = "mi/hr"

    temp_units = "°F";

    vehicle_id = -1;
    display_name = "Tester";
    if (document.location.href.split('/').pop().split('?')[0] != "map.html") {
        document.location.href.split('/').pop().split('?')[0];
        vehicle_name.innerText = display_name;

        state.innerText = "Online";

        car_type = "model3";
        wheel_type = "Sports19";
        exterior_color = "Red";

        vehicleImg.src = `./img/${car_type}/${wheel_type}/${exterior_color}.png`;
        vehicleImg2.src = `./img/${car_type}/${wheel_type}/${exterior_color}.png`;

        inside_temp = 74;
        insideTemperature.innerText = Math.round(inside_temp) + " " + temp_units;
        insideTemperatureClimate.innerText = Math.round(inside_temp) + " " + temp_units;

        outside_temp = 90;
        outsideTemperatureClimate.innerText = Math.round(outside_temp) + " " + temp_units;

        odometer_miles = 12345;
        odometer_miles = Math.round(odometer_miles);
        odometer.innerText = odometer_miles + " miles";

        climate_mode = 1;
        if (climate_mode) {
            climate_mode = "On";
            acOnOff.innerHTML = "<img src='img/Climate-On.png'>"
        } else {
            climate_mode = "Off";
            acOnOff.innerHTML = "<img src='img/Climate-Off.png'>"
        }

        range.innerText = "155 miles (50%)";

        chargeState.innerText = "Charging";

        chargeRate.innerText = "40 " + "mi/hr";

        timeRemaining = 3.875;
        if (timeRemaining) {
            let hours = timeRemaining - (timeRemaining % 1);
            let minutes = Math.round((timeRemaining % 1) * 60);
            timeRemaining = `${hours} hr ${minutes} min`;

            remaining.innerText = timeRemaining;
        }

        model.innerText = "3";

        version.innerText = "2020.32.3";

        sentryMode = "Online";
        sentry.innerText = sentryMode;

        door_state = 1;
        lockUnlock.toggleClass('fa-lock');
        if (door_state) {
            door_state = "locked";
            lockUnlock.addClass('fa-lock');
        } else {
            door_state = "unlocked";
            lockUnlock.addClass('fa-unlock');
        }

        if (loaded == 0) {
            showPage();
            loaded = 1;
        } 
    }

    current_time = getCurrentTime();
    last_updated.innerText = `${current_time}`;
}

