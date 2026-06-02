from django.core.management.base import BaseCommand
from products.models import Product

PRODUCTS = [
    # ── Best Sellers ──────────────────────────────────────────────────────────
    {
        'name': 'Royal Canin Adult Labrador Dry Food 12kg',
        'category': 'Dogs',
        'price': 89,
        'original_price': 109,
        'rating': 4.5,
        'reviews': 4823,
        'badge': 'Best Seller',
        'emoji': '🦮',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "Royal Canin Adult Labrador Retriever dry food is specially formulated for pure-bred "
            "Labrador Retrievers over 15 months old. This breed-specific formula supports your Labrador's "
            "unique nutritional needs with a carefully selected combination of nutrients.\n\n"
            "The kibble is designed with an exclusive shape to encourage your Labrador to slow down their "
            "eating and promote proper chewing. The formula contains EPA and DHA to support skin health and "
            "a shiny coat, while the controlled calorie content helps maintain an ideal body weight — a "
            "common concern for the breed.\n\n"
            "Rich in high-quality protein and essential amino acids, this formula supports your dog's muscle "
            "tone and overall health. Antioxidants including vitamins E and C help support a healthy immune "
            "system, keeping your Labrador active and thriving at every stage of their adult life."
        ),
        'highlights': [
            'Breed-specific kibble shape slows eating and encourages chewing',
            'EPA & DHA support healthy skin and a glossy coat',
            'Controlled calorie content helps maintain ideal body weight',
            'Antioxidant complex supports a strong immune system',
        ],
        'specs': {
            'Weight': '12 kg',
            'Life Stage': 'Adult (15 months+)',
            'Breed': 'Labrador Retriever',
            'Protein Content': '26%',
            'Fat Content': '14%',
            'Fibre Content': '3.4%',
            'Flavour': 'Chicken & Rice',
            'Country of Origin': 'France',
        },
    },
    {
        'name': 'Whiskas Ocean Fish Wet Cat Food — Pack of 12',
        'category': 'Cats',
        'price': 18,
        'original_price': 22,
        'rating': 4.3,
        'reviews': 3201,
        'badge': 'Deal',
        'emoji': '🐱',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "Whiskas Ocean Fish wet cat food is crafted with tender chunks of real ocean fish in a rich, "
            "flavourful jelly that cats adore. Each pouch delivers complete and balanced nutrition to keep "
            "your cat healthy, happy, and full of vitality.\n\n"
            "Formulated by nutritionists and veterinary experts, this recipe provides all the essential "
            "vitamins and minerals your adult cat needs daily. The high moisture content supports healthy "
            "hydration — especially important for cats who may not drink enough water on their own.\n\n"
            "Each convenient 85g pouch is perfectly portioned for a single serving, making mealtime easy "
            "and reducing waste. The resealable pack of 12 offers excellent value while ensuring your cat "
            "always has a delicious meal ready to go."
        ),
        'highlights': [
            'Real ocean fish as the primary ingredient',
            'High moisture content supports daily hydration',
            'Complete and balanced nutrition for adult cats',
            'Convenient single-serve pouches — no waste',
        ],
        'specs': {
            'Pack Size': '12 × 85g pouches',
            'Life Stage': 'Adult',
            'Primary Protein': 'Ocean Fish',
            'Moisture Content': '82%',
            'Protein Content': '9%',
            'Fat Content': '4.5%',
            'Format': 'Chunks in Jelly',
            'Country of Origin': 'Australia',
        },
    },
    {
        'name': 'Trixie Interactive Puzzle Feeder Dog Toy',
        'category': 'Dogs',
        'price': 35,
        'original_price': 49,
        'rating': 4.7,
        'reviews': 1842,
        'badge': None,
        'emoji': '🧩',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "The Trixie Interactive Puzzle Feeder is the ultimate mental enrichment toy for dogs of all "
            "sizes. By hiding treats or kibble inside the various compartments, cones, and slides, you "
            "encourage your dog to problem-solve and forage — just as their instincts demand.\n\n"
            "Made from durable, food-safe ABS plastic, this puzzle feeder is built to withstand enthusiastic "
            "play sessions. The non-slip rubber feet keep the board stable on smooth floors, and the "
            "dishwasher-safe design makes cleaning a breeze after every use.\n\n"
            "Regular use of interactive feeders like this one reduces boredom, discourages destructive "
            "behaviour, and helps slow down fast eaters — promoting better digestion. Suitable for beginner "
            "to intermediate skill levels and comes with a visual instruction guide."
        ),
        'highlights': [
            'Stimulates natural foraging instincts and reduces boredom',
            'Non-slip rubber feet keep the board stable during play',
            'Dishwasher safe for quick and hygienic cleaning',
            'Suitable for beginners to intermediate skill levels',
        ],
        'specs': {
            'Dimensions': '31 × 31 × 7 cm',
            'Material': 'Food-safe ABS Plastic',
            'Difficulty Level': 'Level 2 (Intermediate)',
            'Suitable For': 'All breeds',
            'Dishwasher Safe': 'Yes',
            'Non-Slip Base': 'Yes',
            'Country of Origin': 'Germany',
        },
    },
    {
        'name': 'Catit Design Senses Scratcher with Catnip',
        'category': 'Cats',
        'price': 25,
        'original_price': 34,
        'rating': 4.6,
        'reviews': 2130,
        'badge': 'Prime',
        'emoji': '😸',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "The Catit Design Senses Scratcher satisfies your cat's natural urge to scratch while protecting "
            "your furniture. Featuring a wave-shaped corrugated cardboard insert nestled in a sturdy plastic "
            "frame, this scratcher appeals to cats who prefer both horizontal and angled scratching surfaces.\n\n"
            "Includes a generous pouch of 100% natural catnip to entice even the most reluctant scratchers. "
            "Simply sprinkle the catnip over the surface to attract your cat and encourage regular use. "
            "The replaceable cardboard insert extends the product lifespan — just swap it out when it wears down.\n\n"
            "The sleek, modern design complements any home decor, making it as stylish as it is functional. "
            "Compatible with the full Catit Design Senses range for an expanded sensory play experience."
        ),
        'highlights': [
            'Wave-shaped design appeals to horizontal and angled scratching',
            'Includes 100% natural catnip to attract and engage cats',
            'Replaceable corrugated insert for long-term use',
            'Compatible with the Catit Design Senses modular system',
        ],
        'specs': {
            'Dimensions': '43 × 26 × 7 cm',
            'Material': 'Corrugated Cardboard & Plastic',
            'Catnip Included': 'Yes (natural)',
            'Replaceable Insert': 'Yes',
            'Scratching Style': 'Horizontal / Angled',
            'Country of Origin': 'Canada',
        },
    },
    {
        'name': 'Versele-Laga Prestige Budgie Seed Mix 4kg',
        'category': 'Birds',
        'price': 22,
        'original_price': 28,
        'rating': 4.6,
        'reviews': 2341,
        'badge': 'Best Seller',
        'emoji': '🦜',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "Versele-Laga Prestige Budgie Seed Mix is a premium, scientifically balanced blend developed "
            "specifically for budgerigars. Each bag contains a carefully selected mix of high-quality seeds "
            "including canary grass seed, millet, and oats — precisely proportioned to meet the nutritional "
            "needs of budgies at all life stages.\n\n"
            "Enriched with Orlux eggfood, honey, vitamins, and minerals, this seed mix goes beyond ordinary "
            "birdseed to support vibrant plumage, strong bones, and a healthy immune system. The addition of "
            "honey granules makes it irresistible to even the fussiest budgies.\n\n"
            "Manufactured in Belgium using only the finest raw materials, Versele-Laga applies rigorous "
            "quality controls to ensure every batch is fresh, clean, and free from harmful additives. "
            "Trusted by bird breeders and hobbyists worldwide for over 90 years."
        ),
        'highlights': [
            'Scientifically balanced seed blend for budgerigars',
            'Enriched with eggfood, honey, vitamins, and minerals',
            'Supports vibrant plumage and strong immune health',
            'Trusted by breeders worldwide for over 90 years',
        ],
        'specs': {
            'Weight': '4 kg',
            'Primary Seeds': 'Canary Grass, Millet, Oats',
            'Enriched With': 'Eggfood, Honey, Vitamins',
            'Life Stage': 'All stages',
            'Species': 'Budgerigar',
            'Country of Origin': 'Belgium',
        },
    },
    {
        'name': 'Pedigree Adult Chicken & Vegetables Dry Dog Food 10kg',
        'category': 'Dogs',
        'price': 55,
        'original_price': 72,
        'rating': 4.4,
        'reviews': 6120,
        'badge': None,
        'emoji': '🐶',
        'in_stock': True,
        'is_best_seller': True,
        'is_new_arrival': False,
        'description': (
            "Pedigree Adult Chicken & Vegetables dry dog food provides complete and balanced nutrition for "
            "adult dogs of all breeds. Made with real chicken as the number-one ingredient, this wholesome "
            "recipe is complemented by a medley of vegetables and whole grains for sustained energy.\n\n"
            "The formula is enriched with omega-3 and omega-6 fatty acids to promote a healthy coat and "
            "skin, along with calcium and phosphorus to support strong teeth and bones. Antioxidants "
            "including vitamin E help strengthen your dog's natural defences.\n\n"
            "Crunchy kibble texture helps reduce tartar build-up and freshens breath with every bite. "
            "Pedigree remains one of Australia's most trusted dog food brands — loved by dogs and owners alike."
        ),
        'highlights': [
            'Real chicken as the number-one ingredient',
            'Omega-3 & omega-6 fatty acids for coat and skin health',
            'Crunchy kibble helps reduce tartar and freshen breath',
            'Complete and balanced for all adult breeds',
        ],
        'specs': {
            'Weight': '10 kg',
            'Life Stage': 'Adult',
            'Primary Protein': 'Chicken',
            'Protein Content': '22%',
            'Fat Content': '10%',
            'Fibre Content': '3%',
            'Flavour': 'Chicken & Vegetables',
            'Country of Origin': 'Australia',
        },
    },
    # ── New Arrivals ──────────────────────────────────────────────────────────
    {
        'name': 'PetSafe Automatic Ball Launcher Dog Toy',
        'category': 'Dogs',
        'price': 145,
        'original_price': 165,
        'rating': 4.4,
        'reviews': 312,
        'badge': 'New',
        'emoji': '🎾',
        'in_stock': True,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "The PetSafe Automatic Ball Launcher lets your dog enjoy a game of fetch anytime — no human "
            "required. Compatible with standard tennis balls, the launcher can be set to one of five "
            "distance settings (3 m to 9 m) and adjustable angle positions.\n\n"
            "Built-in sensors detect when a ball is placed in the tube, automatically launching after a "
            "short countdown. A built-in rest period between launches prevents overexertion, keeping play "
            "sessions safe and fun.\n\n"
            "Suitable for indoor and outdoor use, the launcher runs on AC power or 6 C batteries. "
            "A safety motion sensor pauses the device if anything gets too close to the launch tube."
        ),
        'highlights': [
            'Five distance settings from 3 m to 9 m for customised play',
            'Automatic launch with motion sensor for hands-free fetch',
            'Built-in rest period prevents dog overexertion',
            'Works indoors and outdoors — AC or battery powered',
        ],
        'specs': {
            'Launch Distance': '3 m – 9 m (5 settings)',
            'Ball Size': 'Standard tennis ball',
            'Power': 'AC adaptor or 6× C batteries',
            'Safety Feature': 'Motion sensor auto-pause',
            'Suitable For': 'Dogs of all sizes',
            'Dimensions': '36 × 36 × 46 cm',
            'Country of Origin': 'USA',
        },
    },
    {
        'name': 'Hagen Vision Bird Cage — Medium',
        'category': 'Birds',
        'price': 249,
        'original_price': 279,
        'rating': 4.7,
        'reviews': 189,
        'badge': 'New',
        'emoji': '🏠',
        'in_stock': True,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "The Hagen Vision Bird Cage is a modern, thoughtfully engineered home for small to medium-sized "
            "birds including budgies, cockatiels, and lovebirds. The distinctive panoramic design with wide "
            "wire spacing gives birds maximum visibility and ventilation.\n\n"
            "A unique seed guard prevents seed hulls and feathers from escaping the cage, dramatically "
            "reducing mess. The deep base tray is easy to remove and clean, and the white powder-coated "
            "wire is free from harmful zinc coatings.\n\n"
            "The cage includes two stainless-steel feeding cups, a central top feeder, two wooden perches, "
            "and a swing. Assembly is tool-free and the cage is fully compatible with Hagen's Vision accessories."
        ),
        'highlights': [
            'Panoramic design with wide wire spacing for visibility and ventilation',
            'Integrated seed guard keeps surroundings clean and tidy',
            'Deep pull-out tray for effortless cleaning',
            'Zinc-free powder coating — safe for all bird species',
        ],
        'specs': {
            'Dimensions': '54 × 38 × 60 cm',
            'Wire Spacing': '1.2 cm',
            'Material': 'Zinc-free powder-coated steel',
            'Suitable For': 'Budgies, Cockatiels, Lovebirds',
            'Included': '2 cups, 2 perches, 1 swing',
            'Seed Guard': 'Yes',
            'Country of Origin': 'Canada',
        },
    },
    {
        'name': 'Catmate C300 Automatic Pet Feeder',
        'category': 'Cats',
        'price': 175,
        'original_price': 199,
        'rating': 4.5,
        'reviews': 421,
        'badge': 'New',
        'emoji': '🤖',
        'in_stock': False,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "The Catmate C300 Automatic Pet Feeder ensures your cat or small dog is fed on schedule — "
            "even when you're away from home. Programme up to three meals per day with precise portion sizes.\n\n"
            "Two compartments hold up to 300g of wet or dry food each, with airtight lids that lock in "
            "freshness until mealtime. A built-in ice pack tray can be frozen and inserted beneath the food "
            "compartments to keep wet food fresh for up to 24 hours.\n\n"
            "Battery operated (3 × AA batteries included), the C300 requires no Wi-Fi or app — making it "
            "reliable, fuss-free, and perfect for travel or overnight stays."
        ),
        'highlights': [
            'Programme up to 3 meals per day with precise portions',
            'Airtight compartment lids lock in freshness',
            'Freezable ice pack tray keeps wet food fresh up to 24 hours',
            'Battery operated — no Wi-Fi or app required',
        ],
        'specs': {
            'Capacity': '2 × 300g compartments',
            'Meal Settings': 'Up to 3 per day',
            'Power': '3 × AA batteries (included)',
            'Suitable For': 'Cats & small dogs',
            'Ice Pack': 'Yes (included)',
            'Dimensions': '35 × 22 × 8 cm',
            'Country of Origin': 'United Kingdom',
        },
    },
    {
        'name': 'Tropican High Performance Parrot Granules 1.8kg',
        'category': 'Birds',
        'price': 79,
        'original_price': 92,
        'rating': 4.8,
        'reviews': 254,
        'badge': 'New',
        'emoji': '🦅',
        'in_stock': True,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "Tropican High Performance Granules are scientifically formulated to meet the elevated nutritional "
            "demands of active, breeding, or recovering parrots. Each granule is baked — not extruded — to "
            "preserve the natural integrity of high-quality ingredients.\n\n"
            "The high protein content (21%) and increased fat levels support feather regeneration, muscle "
            "development, and reproductive health. Free from artificial colours, flavours, and preservatives.\n\n"
            "Suitable for African Greys, Amazons, Cockatoos, Eclectus, and Macaws. Can be fed as a complete "
            "diet or supplement during periods of increased nutritional demand."
        ),
        'highlights': [
            'High protein (21%) formula for active and breeding parrots',
            'Baked — not extruded — to preserve ingredient integrity',
            'No artificial colours, flavours, or preservatives',
            'Suitable for large parrot species including Macaws and Cockatoos',
        ],
        'specs': {
            'Weight': '1.8 kg',
            'Protein Content': '21%',
            'Fat Content': '9%',
            'Species': 'Large parrots (African Grey, Amazon, Macaw, Cockatoo)',
            'Artificial Additives': 'None',
            'Format': 'Baked granules',
            'Country of Origin': 'Canada',
        },
    },
    {
        'name': 'Kong Classic Stuffable Dog Chew Toy — Large',
        'category': 'Dogs',
        'price': 52,
        'original_price': 62,
        'rating': 4.9,
        'reviews': 8740,
        'badge': 'New',
        'emoji': '🔴',
        'in_stock': True,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "The KONG Classic is one of the world's most iconic dog toys — trusted by vets, trainers, and "
            "dog owners for over 45 years. Made from KONG's patented natural rubber compound, the Classic is "
            "virtually indestructible for most dogs while remaining gentle on teeth and gums.\n\n"
            "The hollow core can be stuffed with kibble, peanut butter, or KONG Easy Treat paste for extended "
            "mental enrichment. Frozen overnight, a stuffed KONG can keep a dog occupied for hours.\n\n"
            "The large size is suitable for dogs 13–30 kg. Dishwasher safe for quick and hygienic cleaning. "
            "Recommended by professional dog trainers globally."
        ),
        'highlights': [
            'Virtually indestructible natural rubber — safe on teeth and gums',
            'Hollow core accepts treats, kibble, or paste for extended engagement',
            'Freeze stuffed for hours of enrichment — great for crate training',
            'Recommended by vets and professional dog trainers worldwide',
        ],
        'specs': {
            'Size': 'Large (fits dogs 13–30 kg)',
            'Material': 'Natural rubber compound',
            'Dishwasher Safe': 'Yes',
            'Stuffable': 'Yes',
            'Bounce Type': 'Unpredictable',
            'Colour': 'Red',
            'Country of Origin': 'USA',
        },
    },
    {
        'name': 'Furminator Deshedding Tool for Long Hair Cats',
        'category': 'Cats',
        'price': 99,
        'original_price': 119,
        'rating': 4.6,
        'reviews': 3312,
        'badge': 'New',
        'emoji': '✂️',
        'in_stock': True,
        'is_best_seller': False,
        'is_new_arrival': True,
        'description': (
            "The FURminator deShedding Tool for Long Hair Cats is the professional-grade grooming solution "
            "trusted by cat owners worldwide. Its stainless-steel deShedding edge reaches through the topcoat "
            "to safely and gently remove loose undercoat hair.\n\n"
            "Clinically proven to reduce shedding by up to 90% with regular use. The ergonomic handle "
            "provides a comfortable grip during grooming sessions, and the FURejector button releases "
            "collected fur with a single click.\n\n"
            "This long-hair version features a wider, curved edge designed to glide through thick, flowing "
            "coats. Recommended for use 1–2 times per week for 10–20 minutes. Suitable for cats over 4 kg."
        ),
        'highlights': [
            'Reduces shedding by up to 90% with regular use',
            'Stainless-steel edge removes undercoat without cutting topcoat',
            'FURejector button releases collected fur cleanly and easily',
            'Ergonomic handle for comfortable extended grooming sessions',
        ],
        'specs': {
            'Edge Width': '6.5 cm',
            'Suitable For': 'Long hair cats over 4 kg',
            'Material': 'Stainless steel & ABS plastic',
            'FURejector Button': 'Yes',
            'Recommended Use': '1–2 times per week, 10–20 minutes',
            'Country of Origin': 'USA',
        },
    },
]


class Command(BaseCommand):
    help = 'Seed products.db with the 12 initial Petoopia products'

    def handle(self, *args, **options):
        if Product.objects.using('products_db').exists():
            self.stdout.write(self.style.WARNING(
                f'Products already exist ({Product.objects.using("products_db").count()} records). '
                'Use --force to re-seed.'
            ))
            if not self.options_force:
                return

        Product.objects.using('products_db').all().delete()

        for data in PRODUCTS:
            Product.objects.using('products_db').create(**data)

        count = Product.objects.using('products_db').count()
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} products into products.db'))

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', dest='force', default=False,
                            help='Delete existing products and re-seed')

    @property
    def options_force(self):
        return getattr(self, '_force', False)

    def execute(self, *args, **options):
        self._force = options.get('force', False)
        return super().execute(*args, **options)
