# v0.4.0 — Real web price verification via gl.nondet.web.render inside eq_principle
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import genlayer.gl as gl
from genlayer import TreeMap, u256
import json


# PRODUCTS: each has a verify_url pointing to a bot-friendly page (Wikipedia or similar)
# that gl.nondet.web.render can successfully fetch at judge time.
# The price shown to players is the "listed" price — the AI fetches the real
# current price from the web and uses that as ground truth for the verdict.
PRODUCTS = [
    # TECH
    {"id": 0,  "cat": "tech", "name": "AirPods Pro (2nd Gen)", "price": 249, "currency": "USD",
     "context": "Apple wireless earbuds with ANC, sold at Apple stores worldwide.",
     "verify_url": "https://en.wikipedia.org/wiki/AirPods_Pro"},
    {"id": 1,  "cat": "tech", "name": "Netflix Standard Plan (monthly)", "price": 15, "currency": "USD",
     "context": "Netflix mid-tier streaming subscription with HD quality, one account.",
     "verify_url": "https://en.wikipedia.org/wiki/Netflix"},
    {"id": 2,  "cat": "tech", "name": "iPhone 15 (128GB)", "price": 799, "currency": "USD",
     "context": "Apple base model iPhone, newest generation, unlocked from Apple Store.",
     "verify_url": "https://en.wikipedia.org/wiki/IPhone_15"},
    {"id": 3,  "cat": "tech", "name": "Spotify Premium (monthly)", "price": 11, "currency": "USD",
     "context": "Spotify individual ad-free music streaming subscription.",
     "verify_url": "https://en.wikipedia.org/wiki/Spotify_Premium"},
    {"id": 4,  "cat": "tech", "name": "Samsung 65-inch 4K TV", "price": 1100, "currency": "USD",
     "context": "Samsung mid-range 65-inch QLED 4K smart TV, sold at major retailers.",
     "verify_url": "https://en.wikipedia.org/wiki/Samsung_QLED"},
    {"id": 5,  "cat": "tech", "name": "ChatGPT Plus (monthly)", "price": 20, "currency": "USD",
     "context": "OpenAI premium ChatGPT subscription with GPT-4 access.",
     "verify_url": "https://en.wikipedia.org/wiki/ChatGPT_Plus"},
    {"id": 6,  "cat": "tech", "name": "iPad (10th Gen, 64GB)", "price": 449, "currency": "USD",
     "context": "Apple base iPad, newest generation, WiFi only, from Apple Store.",
     "verify_url": "https://en.wikipedia.org/wiki/IPad_(10th_generation)"},
    {"id": 7,  "cat": "tech", "name": "USB-C Cable (Apple, 1m)", "price": 29, "currency": "USD",
     "context": "Apple official 1-metre USB-C cable sold in Apple retail stores.",
     "verify_url": "https://en.wikipedia.org/wiki/USB-C"},
    {"id": 8,  "cat": "tech", "name": "PlayStation 5 (Disc Edition)", "price": 499, "currency": "USD",
     "context": "Sony current-gen gaming console, standard disc version, new.",
     "verify_url": "https://en.wikipedia.org/wiki/PlayStation_5"},
    {"id": 9,  "cat": "tech", "name": "Amazon Echo Dot (5th Gen)", "price": 50, "currency": "USD",
     "context": "Amazon compact smart speaker with Alexa, latest generation.",
     "verify_url": "https://en.wikipedia.org/wiki/Amazon_Echo"},
    # FOOD
    {"id": 10, "cat": "food", "name": "Starbucks Venti Latte", "price": 7, "currency": "USD",
     "context": "A large 20oz hot latte at a US Starbucks location.",
     "verify_url": "https://en.wikipedia.org/wiki/Starbucks"},
    {"id": 11, "cat": "food", "name": "Big Mac Meal (McDonald's)", "price": 11, "currency": "USD",
     "context": "Big Mac, medium fries and medium drink at a US McDonald's.",
     "verify_url": "https://en.wikipedia.org/wiki/Big_Mac"},
    {"id": 12, "cat": "food", "name": "Avocado Toast (brunch cafe)", "price": 18, "currency": "USD",
     "context": "Single slice avocado toast at a trendy brunch cafe in a major US city.",
     "verify_url": "https://en.wikipedia.org/wiki/Avocado_toast"},
    {"id": 13, "cat": "food", "name": "Chipotle Burrito Bowl", "price": 12, "currency": "USD",
     "context": "Standard burrito bowl with protein at a US Chipotle restaurant.",
     "verify_url": "https://en.wikipedia.org/wiki/Chipotle_Mexican_Grill"},
    {"id": 14, "cat": "food", "name": "Smoothie (Jamba Juice)", "price": 9, "currency": "USD",
     "context": "A medium original-blend smoothie at a US Jamba Juice location.",
     "verify_url": "https://en.wikipedia.org/wiki/Jamba_Juice"},
    {"id": 15, "cat": "food", "name": "Bottle of Water (airport)", "price": 5, "currency": "USD",
     "context": "500ml branded bottle of water purchased past security at a US airport.",
     "verify_url": "https://en.wikipedia.org/wiki/Bottled_water"},
    {"id": 16, "cat": "food", "name": "Domino's Large Pepperoni Pizza", "price": 16, "currency": "USD",
     "context": "Large hand-tossed pepperoni pizza ordered online from Domino's US.",
     "verify_url": "https://en.wikipedia.org/wiki/Domino%27s_Pizza"},
    {"id": 17, "cat": "food", "name": "Red Bull (250ml can)", "price": 4, "currency": "USD",
     "context": "Single 250ml can of Red Bull energy drink at a US convenience store.",
     "verify_url": "https://en.wikipedia.org/wiki/Red_Bull"},
    {"id": 18, "cat": "food", "name": "Popcorn (movie theatre)", "price": 9, "currency": "USD",
     "context": "Large bucket of popcorn at a major US cinema chain like AMC or Regal.",
     "verify_url": "https://en.wikipedia.org/wiki/Movie_theater_concessions"},
    {"id": 19, "cat": "food", "name": "Dozen Eggs (grocery store)", "price": 4, "currency": "USD",
     "context": "One dozen large Grade A eggs at a major US grocery store.",
     "verify_url": "https://en.wikipedia.org/wiki/Egg_as_food"},
    # FASHION
    {"id": 20, "cat": "fashion", "name": "Nike Air Force 1 (White)", "price": 110, "currency": "USD",
     "context": "Nike classic white leather low-top sneaker, sold at Nike retail stores.",
     "verify_url": "https://en.wikipedia.org/wiki/Nike_Air_Force_1"},
    {"id": 21, "cat": "fashion", "name": "Levi's 501 Original Jeans", "price": 98, "currency": "USD",
     "context": "Levi's classic straight-fit 501 jeans, sold at Levi's retail stores worldwide.",
     "verify_url": "https://en.wikipedia.org/wiki/Levi%27s_501"},
    {"id": 22, "cat": "fashion", "name": "Rolex Submariner", "price": 9550, "currency": "USD",
     "context": "Entry-level Rolex dive watch, stainless steel, at an authorised dealer.",
     "verify_url": "https://en.wikipedia.org/wiki/Rolex_Submariner"},
    {"id": 23, "cat": "fashion", "name": "Supreme Box Logo Tee", "price": 54, "currency": "USD",
     "context": "Supreme iconic box logo t-shirt, retail price at Supreme store on drop day.",
     "verify_url": "https://en.wikipedia.org/wiki/Supreme_(brand)"},
    {"id": 24, "cat": "fashion", "name": "Zara Basic T-Shirt", "price": 26, "currency": "USD",
     "context": "Plain cotton crew-neck t-shirt from Zara's basic collection.",
     "verify_url": "https://en.wikipedia.org/wiki/Zara_(retailer)"},
    {"id": 25, "cat": "fashion", "name": "Canada Goose Expedition Parka", "price": 1195, "currency": "USD",
     "context": "Canada Goose flagship expedition-grade down parka, full retail price.",
     "verify_url": "https://en.wikipedia.org/wiki/Canada_Goose_(clothing)"},
    {"id": 26, "cat": "fashion", "name": "Hermes Birkin (35cm)", "price": 11400, "currency": "USD",
     "context": "Entry-level Hermes Birkin bag in togo leather, retail price if available.",
     "verify_url": "https://en.wikipedia.org/wiki/Birkin_bag"},
    {"id": 27, "cat": "fashion", "name": "H&M Basic Hoodie", "price": 25, "currency": "USD",
     "context": "Plain cotton pullover hoodie from H&M basics range.",
     "verify_url": "https://en.wikipedia.org/wiki/H%26M"},
    {"id": 28, "cat": "fashion", "name": "Ray-Ban Wayfarer Sunglasses", "price": 163, "currency": "USD",
     "context": "Classic Ray-Ban Wayfarer in black, standard size, from Ray-Ban store.",
     "verify_url": "https://en.wikipedia.org/wiki/Ray-Ban_Wayfarer"},
    {"id": 29, "cat": "fashion", "name": "Balenciaga Triple S Sneakers", "price": 995, "currency": "USD",
     "context": "Balenciaga chunky Triple S trainer, full retail at Balenciaga boutique.",
     "verify_url": "https://en.wikipedia.org/wiki/Balenciaga_(brand)"},
    # SERVICES
    {"id": 30, "cat": "services", "name": "Uber (3-mile city ride)", "price": 18, "currency": "USD",
     "context": "Standard UberX ride, approximately 3 miles in a major US city, surge-free.",
     "verify_url": "https://en.wikipedia.org/wiki/Uber"},
    {"id": 31, "cat": "services", "name": "Gym Membership (Planet Fitness)", "price": 25, "currency": "USD",
     "context": "Planet Fitness classic monthly membership, unlimited access, US location.",
     "verify_url": "https://en.wikipedia.org/wiki/Planet_Fitness"},
    {"id": 32, "cat": "services", "name": "Haircut (barber, no frills)", "price": 30, "currency": "USD",
     "context": "Standard men's haircut at a no-frills barber shop in a US city.",
     "verify_url": "https://en.wikipedia.org/wiki/Barbershop"},
    {"id": 33, "cat": "services", "name": "Car Wash (full service)", "price": 25, "currency": "USD",
     "context": "Full-service car wash including interior wipe-down at a US car wash facility.",
     "verify_url": "https://en.wikipedia.org/wiki/Car_wash"},
    {"id": 34, "cat": "services", "name": "ATM Fee (out-of-network)", "price": 5, "currency": "USD",
     "context": "Combined ATM fee for using an out-of-network ATM in the US.",
     "verify_url": "https://en.wikipedia.org/wiki/Automated_teller_machine"},
    {"id": 35, "cat": "services", "name": "Checked Bag Fee (airline)", "price": 35, "currency": "USD",
     "context": "First checked bag fee on a major US domestic airline like Delta or United.",
     "verify_url": "https://en.wikipedia.org/wiki/Airline_baggage_fees"},
    {"id": 36, "cat": "services", "name": "iCloud Storage 50GB (monthly)", "price": 1, "currency": "USD",
     "context": "Apple iCloud+ 50GB storage plan, monthly subscription.",
     "verify_url": "https://en.wikipedia.org/wiki/ICloud"},
    {"id": 37, "cat": "services", "name": "Hotel Parking (per night)", "price": 45, "currency": "USD",
     "context": "Overnight self-parking fee at a mid-range hotel in a major US city.",
     "verify_url": "https://en.wikipedia.org/wiki/Parking_lot"},
    {"id": 38, "cat": "services", "name": "LinkedIn Premium (monthly)", "price": 40, "currency": "USD",
     "context": "LinkedIn Premium Career monthly subscription for job seekers.",
     "verify_url": "https://en.wikipedia.org/wiki/LinkedIn"},
    {"id": 39, "cat": "services", "name": "Priority Boarding (airline)", "price": 25, "currency": "USD",
     "context": "Add-on priority boarding fee on a major US airline for a domestic flight.",
     "verify_url": "https://en.wikipedia.org/wiki/Boarding_pass"},
    # EXPERIENCES
    {"id": 40, "cat": "experiences", "name": "Disney World 1-Day Ticket", "price": 109, "currency": "USD",
     "context": "Base one-day single-park ticket to Walt Disney World, Orlando, weekday lowest tier.",
     "verify_url": "https://en.wikipedia.org/wiki/Walt_Disney_World"},
    {"id": 41, "cat": "experiences", "name": "Taylor Swift Concert Ticket (floor)", "price": 450, "currency": "USD",
     "context": "Face-value floor ticket to a Taylor Swift Eras Tour show, via Ticketmaster.",
     "verify_url": "https://en.wikipedia.org/wiki/The_Eras_Tour"},
    {"id": 42, "cat": "experiences", "name": "NYC Yellow Cab (JFK to Manhattan)", "price": 70, "currency": "USD",
     "context": "Flat-rate yellow taxi from JFK airport to anywhere in Manhattan, excluding tip and tolls.",
     "verify_url": "https://en.wikipedia.org/wiki/Taxi_and_ridesharing_usage_in_New_York_City"},
    {"id": 43, "cat": "experiences", "name": "Escape Room (per person)", "price": 35, "currency": "USD",
     "context": "Per-person price for a standard 60-minute escape room experience in a US city.",
     "verify_url": "https://en.wikipedia.org/wiki/Escape_room"},
    {"id": 44, "cat": "experiences", "name": "Museum of Modern Art (MoMA) Ticket", "price": 30, "currency": "USD",
     "context": "Adult general admission to MoMA in New York City.",
     "verify_url": "https://en.wikipedia.org/wiki/Museum_of_Modern_Art"},
    {"id": 45, "cat": "experiences", "name": "Coachella Weekend Pass", "price": 549, "currency": "USD",
     "context": "General admission 3-day weekend pass to Coachella Valley Music Festival, face value.",
     "verify_url": "https://en.wikipedia.org/wiki/Coachella_Valley_Music_and_Arts_Festival"},
    {"id": 46, "cat": "experiences", "name": "NBA Game (nosebleed seat)", "price": 45, "currency": "USD",
     "context": "Upper-level seat for a regular season NBA game at a major US arena, face value.",
     "verify_url": "https://en.wikipedia.org/wiki/National_Basketball_Association"},
    {"id": 47, "cat": "experiences", "name": "Golf Round (public course)", "price": 65, "currency": "USD",
     "context": "18-hole green fee at a mid-range public golf course in the US, weekend rate.",
     "verify_url": "https://en.wikipedia.org/wiki/Golf_course"},
    {"id": 48, "cat": "experiences", "name": "Laser Tag (per session)", "price": 12, "currency": "USD",
     "context": "Single 15-minute laser tag session at a US entertainment centre.",
     "verify_url": "https://en.wikipedia.org/wiki/Laser_tag"},
    {"id": 49, "cat": "experiences", "name": "Sky Diving (tandem jump)", "price": 250, "currency": "USD",
     "context": "Tandem skydive with instructor from 15,000 feet at a US drop zone.",
     "verify_url": "https://en.wikipedia.org/wiki/Tandem_skydiving"},
]

BOTS = {
    "bot_bargainbabs": {
        "name": "BargainBabs",
        "verdict_weights": [2, 1, 7],
        "comments": {
            "STEAL":      ["Honey, {product} at that price? I nearly fell off my chair. Add it to cart immediately.", "This is practically giving {product} away. Someone miscalculated and I am not complaining.", "STEAL alert on {product}! I have paid more for things I do not even use."],
            "FAIR":       ["{product} is priced exactly where it should be. Not exciting but honest.", "Fine. {product} is fair. I would still look for a coupon but I respect the price."],
            "OVERPRICED": ["{product} at that price? Even I think that is pushing it and I love a bargain hunt."],
        }
    },
    "bot_pricedoutpaul": {
        "name": "PricedOutPaul",
        "verdict_weights": [2, 7, 1],
        "comments": {
            "OVERPRICED": ["Absolutely not. {product} at that price is highway robbery and someone approved this.", "I have done the maths on {product}. The margin they are making is obscene. Overpriced.", "Every time I see {product} priced like this I lose a little more faith in the market."],
            "FAIR":       ["{product} is fair. I hate to admit it but the numbers check out this time.", "Grudging admission: {product} is reasonably priced. Do not expect me to be happy about it."],
            "STEAL":      ["{product} for that price? Either it is a loss leader or something is very wrong. I am suspicious."],
        }
    },
    "bot_middlegroundmo": {
        "name": "MiddlegroundMo",
        "verdict_weights": [6, 2, 2],
        "comments": {
            "FAIR":       ["{product} seems about right to me. You get what you pay for here.", "Honestly {product} is fair. I have seen worse and I have seen better. This is the middle.", "No complaints on {product}. Market rate, nothing more nothing less."],
            "OVERPRICED": ["{product} is a bit much. Not outrageous but you are paying a premium you did not ask for.", "I wanted to say fair on {product} but I cannot quite get there. Slightly over."],
            "STEAL":      ["{product} is a genuine deal. I do not say that often but the price is right here."],
        }
    },
    "bot_wildcardwendy": {
        "name": "WildcardWendy",
        "verdict_weights": [3, 4, 3],
        "comments": {
            "OVERPRICED": ["Something about {product} at that price just feels wrong and I cannot explain it. Overpriced.", "{product} priced like that? In this economy? Bold move. OVERPRICED.", "I woke up today and chose chaos. {product} is overpriced. Next."],
            "STEAL":      ["{product} for that?! STEAL. I do not make the rules I just call it as I see it.", "Wendy says STEAL on {product} and Wendy is never wrong about these things. Allegedly."],
            "FAIR":       ["Fine, {product} is fair. Today I am being reasonable. Do not get used to it.", "{product} — fair. Wendy has spoken. Moving on."],
        }
    },
}

BOT_IDS = ("bot_bargainbabs", "bot_pricedoutpaul", "bot_middlegroundmo", "bot_wildcardwendy")
VERDICTS = ["FAIR", "OVERPRICED", "STEAL"]


class NameYourPrice(gl.Contract):

    game_count: u256
    room_count: u256
    recent_count: u256
    rooms: TreeMap[str, str]
    player_stats: TreeMap[str, str]
    recent_game_ids: TreeMap[u256, str]

    def __init__(self):
        self.game_count = u256(0)
        self.room_count = u256(0)
        self.recent_count = u256(0)

    # ----------------------------------------------------------------
    # Internal helpers
    # ----------------------------------------------------------------

    def _read_room(self, room_code: str) -> dict:
        return json.loads(self.rooms[room_code])

    def _write_room(self, room_code: str, room_data: dict) -> None:
        self.rooms[room_code] = json.dumps(room_data)

    def _read_stats(self, address: str) -> dict:
        stats_json = self.player_stats.get(address)
        if stats_json is None:
            return {"games_played": 0, "total_score": 0, "wins": 0, "best_round_score": 0, "display_name": ""}
        return json.loads(stats_json)

    def _write_stats(self, address: str, stats: dict) -> None:
        self.player_stats[address] = json.dumps(stats)

    def _pick_products(self, seed: int) -> list:
        total = len(PRODUCTS)
        i1 = seed % total
        i2 = (seed * 7 + 13) % total
        i3 = (seed * 13 + 29) % total
        if i2 == i1:
            i2 = (i2 + 1) % total
        if i3 == i1 or i3 == i2:
            i3 = (i3 + 1) % total
        if i3 == i1:
            i3 = (i3 + 1) % total
        return [PRODUCTS[i1], PRODUCTS[i2], PRODUCTS[i3]]

    def _pick_verdict(self, bot_id: str, seed: int) -> str:
        weights = BOTS[bot_id]["verdict_weights"]
        roll = seed % 10
        if roll < weights[0]:
            return "FAIR"
        elif roll < weights[0] + weights[1]:
            return "OVERPRICED"
        else:
            return "STEAL"

    def _pick_comment(self, bot_id: str, verdict: str, product_name: str, seed: int) -> str:
        comments = BOTS[bot_id]["comments"].get(verdict, BOTS[bot_id]["comments"]["FAIR"])
        return comments[seed % len(comments)].replace("{product}", product_name)

    def _make_room_code(self) -> str:
        self.room_count = u256(int(self.room_count) + 1)
        n = int(self.game_count) * 1009 + int(self.room_count) * 97 + 42
        chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        code = ""
        for _ in range(6):
            code = code + chars[n % len(chars)]
            n = n // len(chars)
        return code

    # ----------------------------------------------------------------
    # Public write methods
    # ----------------------------------------------------------------

    @gl.public.write
    def create_room(self, host_address: str, host_name: str) -> str:
        self.game_count = u256(int(self.game_count) + 1)
        code = self._make_room_code()
        seed = int(self.game_count) * 1009 + int(self.room_count) * 97
        products = self._pick_products(seed)

        room_data = {
            "code": code,
            "host": host_address,
            "status": "lobby",
            "is_solo": False,
            "game_id": int(self.game_count),
            "players": {
                host_address: {
                    "name": host_name,
                    "address": host_address,
                    "ready": False,
                    "score": 0,
                    "is_bot": False
                }
            },
            "products": products,
            "submissions_1": {},
            "submissions_2": {},
            "submissions_3": {},
            "bot_submissions_1": {},
            "bot_submissions_2": {},
            "bot_submissions_3": {},
            "rankings": [],
        }
        self._write_room(code, room_data)
        stats = self._read_stats(host_address)
        stats["display_name"] = host_name
        self._write_stats(host_address, stats)
        return code

    @gl.public.write
    def create_solo_room(self, player_address: str, player_name: str) -> str:
        self.game_count = u256(int(self.game_count) + 1)
        code = self._make_room_code()
        seed = int(self.game_count) * 1009 + int(self.room_count) * 97

        products = self._pick_products(seed)

        players = {
            player_address: {
                "name": player_name,
                "address": player_address,
                "ready": True,
                "score": 0,
                "is_bot": False
            }
        }
        for bot_id in BOT_IDS:
            players[bot_id] = {
                "name": BOTS[bot_id]["name"],
                "address": bot_id,
                "ready": True,
                "score": 0,
                "is_bot": True
            }

        bot_submissions_1 = {}
        bot_submissions_2 = {}
        bot_submissions_3 = {}

        for i, bot_id in enumerate(BOT_IDS):
            for round_num in range(1, 4):
                bot_seed = seed + i * 37 + round_num * 11
                product = products[round_num - 1]
                verdict = self._pick_verdict(bot_id, bot_seed + 7)
                comment = self._pick_comment(bot_id, verdict, product["name"], bot_seed + 13)
                submission = {
                    "player": bot_id,
                    "name": BOTS[bot_id]["name"],
                    "verdict": verdict,
                    "comment": comment,
                    "is_bot": True
                }
                if round_num == 1:
                    bot_submissions_1[bot_id] = submission
                elif round_num == 2:
                    bot_submissions_2[bot_id] = submission
                else:
                    bot_submissions_3[bot_id] = submission

        room_data = {
            "code": code,
            "host": player_address,
            "status": "voting_1",
            "is_solo": True,
            "game_id": int(self.game_count),
            "players": players,
            "products": products,
            "submissions_1": {},
            "submissions_2": {},
            "submissions_3": {},
            "bot_submissions_1": bot_submissions_1,
            "bot_submissions_2": bot_submissions_2,
            "bot_submissions_3": bot_submissions_3,
            "rankings": [],
            "bots_ready": True,
        }
        self._write_room(code, room_data)
        stats = self._read_stats(player_address)
        stats["display_name"] = player_name
        self._write_stats(player_address, stats)
        return code

    @gl.public.write
    def join_room(self, room_code: str, player_address: str, player_name: str) -> None:
        room_data = self._read_room(room_code)
        if room_data["status"] != "lobby":
            return
        if player_address in room_data["players"]:
            return
        if len(room_data["players"]) >= 5:
            return
        room_data["players"][player_address] = {
            "name": player_name,
            "address": player_address,
            "ready": False,
            "score": 0,
            "is_bot": False
        }
        self._write_room(room_code, room_data)
        stats = self._read_stats(player_address)
        stats["display_name"] = player_name
        self._write_stats(player_address, stats)

    @gl.public.write
    def toggle_ready(self, room_code: str, player_address: str) -> None:
        room_data = self._read_room(room_code)
        if room_data["status"] != "lobby":
            return
        if player_address not in room_data["players"]:
            return
        room_data["players"][player_address]["ready"] = not room_data["players"][player_address]["ready"]
        self._write_room(room_code, room_data)

    @gl.public.write
    def start_game(self, room_code: str, host_address: str) -> None:
        room_data = self._read_room(room_code)
        if room_data["host"] != host_address:
            return
        if room_data["status"] != "lobby":
            return
        room_data["status"] = "voting_1"
        self._write_room(room_code, room_data)

    @gl.public.write
    def submit_verdict(self, room_code: str, player_address: str, round_num: str, verdict: str) -> None:
        room_data = self._read_room(room_code)
        status_map = {"1": "voting_1", "2": "voting_2", "3": "voting_3"}
        expected_status = status_map.get(round_num)
        if expected_status is None:
            return
        if room_data["status"] != expected_status:
            return
        if player_address not in room_data["players"]:
            return
        if verdict not in VERDICTS:
            return

        subs_key_map = {"1": "submissions_1", "2": "submissions_2", "3": "submissions_3"}
        subs_key = subs_key_map[round_num]

        room_data[subs_key][player_address] = {
            "player": player_address,
            "name": room_data["players"][player_address]["name"],
            "verdict": verdict,
            "comment": "",
            "is_bot": False
        }
        self._write_room(room_code, room_data)

    @gl.public.write
    def advance_round(self, room_code: str) -> None:
        room_data = self._read_room(room_code)
        status = room_data["status"]

        if status == "voting_1":
            room_data["status"] = "voting_2"
        elif status == "voting_2":
            room_data["status"] = "voting_3"
        elif status == "voting_3":
            room_data["status"] = "judging"
        else:
            return

        self._write_room(room_code, room_data)

    @gl.public.write
    def calculate_results(self, room_code: str) -> None:
        room_data = self._read_room(room_code)
        if room_data["status"] != "judging":
            return

        products = room_data["products"]

        # Merge human and bot submissions
        all_submissions_1 = {}
        all_submissions_1.update(room_data["submissions_1"])
        all_submissions_1.update(room_data["bot_submissions_1"])

        all_submissions_2 = {}
        all_submissions_2.update(room_data["submissions_2"])
        all_submissions_2.update(room_data["bot_submissions_2"])

        all_submissions_3 = {}
        all_submissions_3.update(room_data["submissions_3"])
        all_submissions_3.update(room_data["bot_submissions_3"])

        # Build player verdicts text for prompt
        def build_verdicts_text(subs, round_num):
            lines = []
            for player_id, sub in subs.items():
                lines.append("  Player " + player_id + " voted: " + sub["verdict"])
            return "\n".join(lines)

        verdicts_1 = build_verdicts_text(all_submissions_1, 1)
        verdicts_2 = build_verdicts_text(all_submissions_2, 2)
        verdicts_3 = build_verdicts_text(all_submissions_3, 3)

        # Capture product data for use inside generate()
        p0 = products[0]
        p1 = products[1]
        p2 = products[2]

        url0 = p0.get("verify_url", "")
        url1 = p1.get("verify_url", "")
        url2 = p2.get("verify_url", "")

        # ── THE KEY GenLayer PATTERN ──────────────────────────────────────────
        # gl.nondet.web.render must be called INSIDE the generate() function
        # which is passed to gl.eq_principle.prompt_non_comparative.
        # This is the only place web fetching is permitted.
        # Each validator fetches the same URLs and reaches consensus on the result.

        def generate():
            # Fetch live web data for all 3 products
            def safe_fetch(url):
                if not url:
                    return "no url available"
                try:
                    content = gl.nondet.web.render(url)
                    return content[:1500] if content else "page empty"
                except Exception as e:
                    return "fetch failed: " + str(e)

            web0 = safe_fetch(url0)
            web1 = safe_fetch(url1)
            web2 = safe_fetch(url2)

            prompt = (
                "You are judging a price-guessing game. For each of the 3 products below, "
                "you have been given LIVE WEB DATA fetched right now from Wikipedia or a product page. "
                "Use this live data as ground truth to determine if the listed price is FAIR, OVERPRICED, or STEAL.\n\n"
                "FAIR = listed price matches current real-world market price.\n"
                "OVERPRICED = listed price is notably higher than actual current price.\n"
                "STEAL = listed price is notably lower than actual current market value.\n\n"

                "=== PRODUCT 1: " + p0["name"] + " ===\n"
                "Listed price in game: $" + str(p0["price"]) + " " + p0["currency"] + "\n"
                "Context: " + p0["context"] + "\n"
                "Live web data: " + web0 + "\n\n"
                "Player verdicts for Product 1:\n" + verdicts_1 + "\n\n"

                "=== PRODUCT 2: " + p1["name"] + " ===\n"
                "Listed price in game: $" + str(p1["price"]) + " " + p1["currency"] + "\n"
                "Context: " + p1["context"] + "\n"
                "Live web data: " + web1 + "\n\n"
                "Player verdicts for Product 2:\n" + verdicts_2 + "\n\n"

                "=== PRODUCT 3: " + p2["name"] + " ===\n"
                "Listed price in game: $" + str(p2["price"]) + " " + p2["currency"] + "\n"
                "Context: " + p2["context"] + "\n"
                "Live web data: " + web2 + "\n\n"
                "Player verdicts for Product 3:\n" + verdicts_3 + "\n\n"

                "Scoring rules:\n"
                "- +10 points if player verdict matches correct verdict\n"
                "- +7 minority bonus if fewer than 40% of players got it correct\n"
                "- +3 early vote bonus for the first player listed per round\n"
                "- Maximum 20 points per round\n\n"
                "Return ONLY a JSON object starting with { and ending with }. No markdown, no preamble.\n"
                'Format: {"product_verdicts": ['
                '{"product_id": 0, "correct_verdict": "FAIR", "reason": "short sentence citing live data"}, '
                '{"product_id": 1, "correct_verdict": "OVERPRICED", "reason": "short sentence"}, '
                '{"product_id": 2, "correct_verdict": "STEAL", "reason": "short sentence"}'
                '], "player_scores": ['
                '{"player": "player_id", "round_scores": [10, 7, 0], "total": 17}'
                ']}\n'
                "Include ALL players in player_scores. Order by total descending."
            )

            return gl.nondet.exec_prompt(prompt)

        result_raw = gl.eq_principle.prompt_non_comparative(
            generate,
            task="fetch live web prices for 3 products and score players in a price-guessing game",
            criteria="valid JSON with product_verdicts array containing verdicts grounded in live web data, and player_scores array"
        )

        # Defensive JSON parsing
        product_verdicts = []
        player_scores = []
        try:
            start = result_raw.find("{")
            end = result_raw.rfind("}") + 1
            if start >= 0 and end > start:
                result_json = json.loads(result_raw[start:end])
                product_verdicts = result_json.get("product_verdicts", [])
                player_scores = result_json.get("player_scores", [])
        except Exception:
            product_verdicts = []
            player_scores = []

        # Build score lookup
        score_lookup = {}
        for entry in player_scores:
            pid = entry.get("player", "")
            score_lookup[pid] = {
                "round_scores": entry.get("round_scores", [0, 0, 0]),
                "total": entry.get("total", 0)
            }

        # Build verdict lookup
        verdict_lookup = {}
        for v in product_verdicts:
            pid_key = str(v.get("product_id", -1))
            verdict_lookup[pid_key] = {
                "correct_verdict": v.get("correct_verdict", "FAIR"),
                "reason": v.get("reason", "")
            }

        room_data["product_verdicts"] = verdict_lookup

        # Collect all players
        all_player_ids = set()
        all_player_ids.update(all_submissions_1.keys())
        all_player_ids.update(all_submissions_2.keys())
        all_player_ids.update(all_submissions_3.keys())

        final_rankings = []
        for player_id in all_player_ids:
            score_data = score_lookup.get(player_id)
            if score_data is None:
                for pid_key, data in score_lookup.items():
                    if (pid_key == player_id or
                            player_id.startswith(pid_key) or
                            pid_key.startswith(player_id[:12])):
                        score_data = data
                        break
                if score_data is None:
                    score_data = {"round_scores": [0, 0, 0], "total": 0}

            total = score_data["total"]
            round_scores = score_data["round_scores"]

            if player_id in room_data["players"]:
                room_data["players"][player_id]["score"] = total

            if player_id in room_data["players"]:
                player_name = room_data["players"][player_id]["name"]
            else:
                player_name = player_id

            correct_count = 0
            subs_by_round = [all_submissions_1, all_submissions_2, all_submissions_3]
            for round_idx in range(3):
                product = products[round_idx]
                v_data = verdict_lookup.get(str(product["id"]), {})
                correct_verdict = v_data.get("correct_verdict", "")
                sub = subs_by_round[round_idx].get(player_id, {})
                if sub.get("verdict") == correct_verdict:
                    correct_count += 1

            final_rankings.append({
                "player": player_id,
                "name": player_name,
                "total_score": total,
                "round_scores": round_scores,
                "correct_verdicts": correct_count,
                "is_bot": player_id.startswith("bot_"),
            })

        final_rankings.sort(key=lambda x: x["total_score"], reverse=True)
        room_data["rankings"] = final_rankings
        room_data["status"] = "completed"
        self._write_room(room_code, room_data)

        # Update player stats (non-bots only)
        for i, rank_entry in enumerate(final_rankings):
            pid = rank_entry["player"]
            if pid.startswith("bot_"):
                continue
            stats = self._read_stats(pid)
            stats["games_played"] = stats["games_played"] + 1
            stats["total_score"] = stats["total_score"] + rank_entry["total_score"]
            if i == 0:
                stats["wins"] = stats["wins"] + 1
            best_round = max(rank_entry["round_scores"]) if rank_entry["round_scores"] else 0
            if best_round > stats.get("best_round_score", 0):
                stats["best_round_score"] = best_round
            self._write_stats(pid, stats)

        # Store in recent games
        idx = int(self.recent_count)
        self.recent_game_ids[u256(idx)] = room_code
        self.recent_count = u256(idx + 1)

    @gl.public.write
    def finalize_game(self, room_code: str) -> None:
        pass

    # ----------------------------------------------------------------
    # Public view methods
    # ----------------------------------------------------------------

    @gl.public.view
    def get_room(self, room_code: str) -> str:
        if room_code not in self.rooms:
            return json.dumps({"error": "Room not found"})
        return self.rooms[room_code]

    @gl.public.view
    def get_player_stats(self, player_address: str) -> str:
        stats_json = self.player_stats.get(player_address)
        if stats_json is None:
            return json.dumps({"games_played": 0, "total_score": 0, "wins": 0, "best_round_score": 0, "display_name": ""})
        return stats_json

    @gl.public.view
    def get_global_leaderboard(self) -> str:
        entries = []
        for address in self.player_stats.keys():
            stats = json.loads(self.player_stats[address])
            if stats["games_played"] > 0:
                avg = stats["total_score"] / stats["games_played"]
                entries.append({
                    "address": address,
                    "name": stats.get("display_name", address[:8]),
                    "games_played": stats["games_played"],
                    "total_score": stats["total_score"],
                    "wins": stats["wins"],
                    "avg_score": round(avg, 1)
                })
        entries.sort(key=lambda x: x["total_score"], reverse=True)
        return json.dumps(entries[:20])

    @gl.public.view
    def get_recent_games(self, limit: int) -> str:
        recent = []
        total = int(self.recent_count)
        start = max(0, total - limit)
        for i in range(start, total):
            code = self.recent_game_ids.get(u256(i))
            if code is None:
                continue
            room_json = self.rooms.get(code)
            if room_json is None:
                continue
            room = json.loads(room_json)
            recent.append({
                "code": code,
                "game_id": room.get("game_id", 0),
                "player_count": len(room["players"]),
                "status": room["status"],
                "winner": room["rankings"][0]["name"] if room["rankings"] else ""
            })
        return json.dumps(recent)
