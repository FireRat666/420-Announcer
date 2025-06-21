const moment = require("moment-timezone");
const { cityMapping } = require("city-timezones"); // Only cityMapping is used, so destructure it.

const AudLink = 'https://audiofiles.firer.at/mp3/11-Amelia/';
const WARNING_MINS = 2;

// Define the locations array here, as it's used in the serverless function
const locations = [
    'Lagos, Nigeria', 'Geneva, Switzerland', 'Milan, Italy', 'Tunis, Tunisia', 'Madrid, Spain', 'Casablanca, Morocco', 'Brussels, Belgium', 'Frankfurt, Germany', 'Budapest, Hungary', 'Newcastle, United Kingdom', 'Vienna, Austria', 'Dakar, Senegal', 'Nottingham, United Kingdom', 'Nouakchott, Mauritania', 'Porto, Portugal', 'Abidjan, Ivory Coast', 'Sheffield, United Kingdom', 'Liverpool, United Kingdom', 'Conakry, Guinea', 'Braga, Portugal', 'Cardiff, United Kingdom', 'Kumasi, Ghana', 'Lisbon, Portugal', 'Newcastle, Australia', 'Nowra, Australia', 'Glasgow, United Kingdom', 'Arawa, Papua New Guinea', 'Launceston, Australia', 'Ballarat, Australia', 'Wagga Wagga, Australia', 'Hobart, Australia', 'Noumea, New Caledonia', 'Bendigo, Australia', 'Ponta Delgada, Portugal', 'Mindelo, Cape Verde', 'Honiara, Solomon Islands', 'Magadan, Russia', 'Praia, Cape Verde', 'Coffs Harbour, Australia', 'Bordertown, Australia', 'Clare, Australia', 'Khabarovsk, Russia', 'Bundaberg, Australia', 'Gold Coast, Australia', 'Toowoomba, Australia', 'Ussuriysk, Russia', 'Mt. Hagen, Papua New Guinea', 'Brisbane, Australia', 'Madang, Papua New Guinea', 'Partizansk, Russia', 'Cairns, Australia', 'Sunshine Coast, Australia', 'Townsville, Australia', 'Lae, Papua New Guinea', 'Agana, Guam', 'Buenos Aires, Argentina', 'Rio de Janeiro, Brazil', 'Yokohama, Japan', 'Belo Horizonte, Brazil', 'Belem, Brazil', 'Santiago, Chile', 'Tokyo, Japan', 'Osaka, Japan', 'Curitiba, Brazil', 'Fukuoka, Japan', 'Busan, South Korea', 'Incheon, South Korea', 'Salvador, Brazil', 'Fox Bay, Falkland Islands', 'Australia/Eucla', 'Deer Lake, Canada', 'Trepassey, Canada', 'Forteau, Canada', 'Corner Brook, Canada', 'Gander, Canada', 'La Scie, Canada', 'Trout River, Canada', 'Channel-Port aux Basques, Canada', 'Stephenville, Canada', 'Taungoo, Myanmar', 'Phyarpon, Myanmar', 'Yaynangyoung, Myanmar', 'Naypyidaw, Myanmar', 'Shwebo, Myanmar', 'Pyay, Myanmar', 'Bago, Myanmar', 'Myeik, Myanmar', 'Magway, Myanmar', 'Pathein, Myanmar', 'Sittwe, Myanmar', 'Houston, United States of America', 'Hinthada, Myanmar', 'Myitkyina, Myanmar', 'St. Louis, United States of America', 'Chicago, United States of America', 'Guatemala, Guatemala', 'Nezahualcoyotl, Mexico', 'Dallas, United States of America', 'Urumqi, China', 'Culiacan, Mexico', 'Edmonton, Canada', 'Ibadan, Nigeria', 'Canberra, Australia', 'Wollongong, Australia', 'Kingston South East, Australia', 'Ceduna, Australia', 'Streaky Bay, Australia', 'Mount Gambier, Australia',
    'Meningie, Australia', 'Wallaroo, Australia', 'Berri, Australia', 'Gawler, Australia', 'Adelaide, Australia', 'Port Augusta, Australia', 'Port Lincoln, Australia', 'Andamooka, Australia', 'Port Pirie, Australia', 'Peterborough, Australia', 'Whyalla, Australia', 'Spassk Dalniy, Russia', 'Rockhampton, Australia', 'Amursk, Russia', 'Komsomolsk na Amure, Russia', 'Lesozavodsk, Russia', 'Mackay, Australia', 'Adelaide River, Australia', 'Erldunda, Australia', 'Tennant Creek, Australia', 'McMinns Lagoon, Australia', 'Alice Springs, Australia', 'Pine Creek, Australia', 'Darwin, Australia', 'Katherine, Australia', 'Yulara, Australia', 'Nagoya, Japan', 'Recife, Brazil', 'Fortaleza, Brazil', 'Brasilia, Brazil', 'Argentia, Canada', 'St. Anthony, Canada', 'Buchans, Canada', 'St. John’s, Canada', 'Tianjin, China', 'Manila, Philippines', 'Dongguan, China', 'Beijing, China', 'Nanjing, China', 'Changchun, China', 'Chongqing, China', 'Harbin, China', 'Xian, China', 'New Taipei, Taiwan', 'Shenzhen, China', 'Guangzhou, China', 'Lima, Peru', 'Ho Chi Minh City, Vietnam', 'Philadelphia, United States of America', 'Medellin, Colombia', 'Hanoi, Vietnam', 'REPLACE'
];


exports.handler = async (event, context) => {
    let _shortestDiff;
    let _next420;
    let _420Timezones = [];

    function checkDiff(time, zone) {
        const diff = time.diff(moment.tz(zone));
        if (diff > -59000 && (_shortestDiff === undefined || diff < _shortestDiff || Math.abs(diff - _shortestDiff) <= 1000)) {
            if (Math.abs(diff - _shortestDiff) > 1000) {
                _420Timezones = [];
            }
            _420Timezones.push(zone);
            _shortestDiff = diff;
            _next420 = time;
        }
    }

    const zones = moment.tz.names().map(function (k) { return k.split('|')[0]; }).filter(function (z) { return z.indexOf('/') >= 0 && !z.startsWith("Etc/"); });

    for (const zone of zones) {
        const morningBlazeTime = moment.tz(zone).set("hour", 4).set("minute", 20).set("seconds", 0);
        checkDiff(morningBlazeTime, zone);
        const eveningBlazeTime = moment.tz(zone).set("hour", 16).set("minute", 20).set("seconds", 0);
        checkDiff(eveningBlazeTime, zone);
    }

    let cities = new Array();
    for (let tz of _420Timezones) {
        cities.push(...cityMapping.filter(c => { if (!c.timezone) { return false; } return c.timezone.toLowerCase() == tz.toLowerCase(); }));
    }

    const outCities = cities.sort((a, b) => b.pop - a.pop).slice(0, 25).map(c => c.city + ", " + c.country);
    const location = outCities[Math.floor(Math.random() * outCities.length)] || _420Timezones[Math.floor(Math.random() * _420Timezones.length)];
    const timeTill420 = moment.duration(_next420.diff(moment()));
    const timeSecs = Math.ceil(timeTill420.asSeconds());
    const timeMins = Math.ceil(timeTill420.asMinutes());

    let timeMinsLink = `https://speak.firer.at/?text=${timeMins}#.mp3`;
    let locationLink = `https://speak.firer.at/?text=${encodeURIComponent(location)}#.mp3`;

    if (timeMins >= 1 && timeMins <= 59) {
        timeMinsLink = `${AudLink}${timeMins}.mp3`;
    }

    if (locations.includes(location)) {
        locationLink = `${AudLink}${encodeURIComponent(location.replace('/', '_'))}.mp3`;
    }

    const nextBlazeMessages = [
        [`${AudLink}Get%20your%20lighters%20ready.mp3`, locationLink, `${AudLink}blaze%20time%20kicks%20off%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Next%20up.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes%20Don’t%20let%20the%20flame%20go%20out.mp3`],
        [`${AudLink}Fresh%20vibes%20incoming.mp3`, locationLink, `${AudLink}lights%20up%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}The%20next%20cloud%20party%20starts%20in.mp3`, timeMinsLink, `${AudLink}minutes%20at.mp3`, locationLink, `${AudLink}don’t%20miss%20it.mp3`],
        [`${AudLink}Warm%20up%20those%20munchies.mp3`, locationLink, `${AudLink}s%20time%20to%20blaze%20is%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`, locationLink, `${AudLink}is%20the%20place%20to%20spark%20and%20chill.mp3`],
        [`${AudLink}Time%20to%20toast%20one.mp3`, locationLink, `${AudLink}is%20sparking%20in%20just.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}The%20rotation’s%20heading%20to.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes%20be%20ready.mp3`],
        [`${AudLink}All%20eyes%20on.mp3`, locationLink, `${AudLink}Blaze%20time%20hits%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Let’s%20roll%20it%20up.mp3`, locationLink, `${AudLink}it’s%20your%20turn%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}The%20next%20spark%20ignites%20in.mp3`, timeMinsLink, `${AudLink}minutes%20at.mp3`, locationLink],
        [`${AudLink}Light%20up%20the%20moment.mp3`, locationLink, `${AudLink}is%20the%20spot%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Countdown%20to%20good%20vibes.mp3`, timeMinsLink, `${AudLink}minutes%20at.mp3`, locationLink],
        [`${AudLink}Your%20next%20chill%20sesh%20kicks%20off%20at.mp3`, locationLink, `${AudLink}in%20just.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Time%20to%20glow%20Meet%20us%20at.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`]
    ];

    const blazeItMessages = [
        [`${AudLink}It’s%20almost%20time%20to%20torch%20it.mp3`, locationLink, `${AudLink}minutes%20til%20420.mp3`, timeMinsLink],
        [`${AudLink}Hey.mp3`, locationLink, `${AudLink}420’s%20about%20to%20hit%20in.mp3`, timeMinsLink, `${AudLink}minutes%20get%20hyped.mp3`],
        [`${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`, locationLink, `${AudLink}will%20be%20cloud%20central%20for%20420%20vibes.mp3`],
        [`${AudLink}Heads%20up.mp3`, locationLink, `${AudLink}minutes%20until%20the%20green%20hour%20strikes.mp3`, timeMinsLink],
        [`${AudLink}Roll%20call%20for.mp3`, locationLink, `${AudLink}420%20magic%20starts%20in%20just.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Brace%20yourselves.mp3`, locationLink, `${AudLink}420%20lands%20in.mp3`, timeMinsLink, `${AudLink}minutes%20Let’s%20blaze.mp3`],
        [`${AudLink}The%20ultimate%20chill%20hits.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes%20spark%20it%20up.mp3`],
        [`${AudLink}420’s%20rolling%20up%20on.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes%20don’t%20miss%20the%20fun.mp3`],
        [`${AudLink}Mellow%20out.mp3`, locationLink, `${AudLink}the%20big%204-2-0%20is%20only.mp3`, timeMinsLink, `${AudLink}minutes%20away.mp3`],
        [`${AudLink}Calling%20all%20stoners%20in.mp3`, locationLink, timeMinsLink, `${AudLink}minutes%20til%20420%20o’clock.mp3`],
        [`${AudLink}It’s%20almost%20420.mp3`, locationLink, `${AudLink}s%20turn%20to%20shine%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Countdown%20to%20420.mp3`, locationLink, `${AudLink}lights%20up%20in.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}Get%20ready.mp3`, locationLink, `${AudLink}It’s%20420%20time%20in%20just.mp3`, timeMinsLink, `${AudLink}minutes.mp3`],
        [`${AudLink}The%20clock’s%20ticking%20for%20420%20in.mp3`, locationLink, `${AudLink}only.mp3`, timeMinsLink, `${AudLink}minutes%20left.mp3`],
        [`${AudLink}Pack%20it%20up%20420%20hits.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}minutes%20don’t%20miss%20it.mp3`],
        [`${AudLink}It's%204%2020%20in.mp3`, locationLink, `${AudLink}in.mp3`, timeMinsLink, `${AudLink}mins!%20Blaze%20it!.mp3`]
    ];

    let messageType = "nextBlaze"; // Default message type
    let messageLinks = nextBlazeMessages[Math.floor(Math.random() * nextBlazeMessages.length)];

    if (timeSecs <= 0 && timeSecs > -60) {
        // It's currently 4:20 in some timezone
        messageType = "blazeItNow";
        messageLinks = blazeItMessages[Math.floor(Math.random() * blazeItMessages.length)];
    } else if (timeMins <= WARNING_MINS && timeMins > 0) {
        // It's in the warning window
        messageType = "blazeItWarning";
        messageLinks = blazeItMessages[Math.floor(Math.random() * blazeItMessages.length)];
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
        },
        body: JSON.stringify({
            next420Time: _next420.toISOString(), // Send ISO string for consistent time
            timeRemainingSeconds: timeSecs,
            timeRemainingMinutes: timeMins,
            location: location,
            messageType: messageType,
            messageLinks: messageLinks,
            rawTimeMinsLink: timeMinsLink, // For debugging/displaying raw links
            rawLocationLink: locationLink // For debugging/displaying raw links
        }),
    };
};