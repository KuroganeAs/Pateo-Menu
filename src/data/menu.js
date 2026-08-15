export const categories = [
  { id: 'sandes', title: { en: 'Sandwiches', pt: 'Sandes', tet: 'Sande' } },
  { id: 'sandes-especiais', title: { en: 'Special Sandwiches & Toasts', pt: 'Sandes Especiais', tet: 'Sande Espesiál' } },
  {
    id: 'barista', title: { en: 'Barista', pt: 'Barista', tet: 'Barista' },
    note: {
      en: 'Takeaway adds $0.20 to your drink',
      pt: 'Takeaway aumenta $0.20 à sua bebida',
      tet: 'Takeaway aumenta $0.20 ba Ita-nia bebida'
    }
  },
  { id: 'croissants', title: { en: 'Croissants', pt: 'Croissants', tet: 'Croissants' } },
  { id: 'pasteis-salgados', title: { en: 'Pastries & Savory', pt: 'Pastéis e Salgados', tet: 'Salgadu sira' } },
  { id: 'bolos-doces', title: { en: 'Cakes & Sweets', pt: 'Bolos e Doces', tet: 'Dose sira' } },
  { id: 'bebidas-cocktails', title: { en: 'Drinks & Cocktails', pt: 'Bebidas e Cocktails', tet: 'Bebida no Koktail' } }
];

export const menuItems = [
  // --- SANDWICHES ---
  {
    id: 's-bola', categoryId: 'sandes', image: null,
    title: { en: 'Bread Roll', pt: 'Bola', tet: 'Bola' },
    description: { en: 'Traditional Portuguese soft bread roll.', pt: 'Bola de pão tradicional portuguesa.', tet: 'Paun bola tradisional Portugés.' },
    price: 0.80,
    variants: [
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 0.80 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 1.40 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 1.40 },
      { name: { en: 'Cured Ham', pt: 'Presunto', tet: 'Presunto' }, price: 1.70 },
      { name: { en: 'Mixed (Ham & Cheese)', pt: 'Mista', tet: 'Mista' }, price: 1.80 },
      { name: { en: 'Mixed Cured Ham & Cheese', pt: 'Mista c/ Presunto', tet: 'Mista ho Presunto' }, price: 1.95 }
    ]
  },
  {
    id: 's-cereal', categoryId: 'sandes', image: null,
    title: { en: 'Cereal Roll', pt: 'Bola Cereais', tet: 'Paun Sereal' },
    description: { en: 'Healthy multi-grain cereal bread roll.', pt: 'Bola de cereais multigrãos.', tet: 'Paun sereal ho fini oin-oin.' },
    price: 1.70,
    variants: [
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 1.70 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.35 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.35 },
      { name: { en: 'Cured Ham', pt: 'Presunto', tet: 'Presunto' }, price: 2.45 },
      { name: { en: 'Mixed', pt: 'Mista', tet: 'Mista' }, price: 2.70 },
      { name: { en: 'Mixed Cured Ham', pt: 'Mista c/ Presunto', tet: 'Mista ho Presunto' }, price: 2.95 }
    ]
  },
  {
    id: 's-saloia', categoryId: 'sandes', image: null,
    title: { en: 'Carcaça Saloia', pt: 'Carcaça Saloia', tet: 'Carcaça Saloia' },
    description: { en: 'Traditional rustic crusty bread.', pt: 'Pão rústico tradicional com côdea estaladiça.', tet: 'Paun rustiku tradisional.' },
    price: 1.60,
    variants: [
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 1.60 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.25 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.25 },
      { name: { en: 'Cured Ham', pt: 'Presunto', tet: 'Presunto' }, price: 2.35 },
      { name: { en: 'Mixed', pt: 'Mista', tet: 'Mista' }, price: 2.75 },
      { name: { en: 'Mixed Cured Ham', pt: 'Mista c/ Presunto', tet: 'Mista ho Presunto' }, price: 2.95 }
    ]
  },
  {
    id: 's-centeio', categoryId: 'sandes', image: null,
    title: { en: 'Rye Roll', pt: 'Bola Centeio', tet: 'Paun Senteiu' },
    description: { en: 'Dark and hearty rye bread roll.', pt: 'Bola de pão de centeio escuro.', tet: 'Paun senteiu metan.' },
    price: 1.70,
    variants: [
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 1.70 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.35 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.35 },
      { name: { en: 'Cured Ham', pt: 'Presunto', tet: 'Presunto' }, price: 2.45 },
      { name: { en: 'Mixed', pt: 'Mista', tet: 'Mista' }, price: 2.70 },
      { name: { en: 'Mixed Cured Ham', pt: 'Mista c/ Presunto', tet: 'Mista ho Presunto' }, price: 2.95 }
    ]
  },
  {
    id: 's-leite', categoryId: 'sandes', image: null,
    title: { en: 'Pão de Leite', pt: 'Pão de Leite', tet: 'Pão de Leite' },
    description: { en: 'Soft, sweet milk bread.', pt: 'Pão de leite macio e adocicado.', tet: 'Paun susubeen mamar no midar.' },
    price: 1.50,
    variants: [
      { name: { en: 'Plain', pt: 'Simples', tet: 'Simples' }, price: 1.50 },
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 1.85 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.35 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.35 },
      { name: { en: 'Mixed', pt: 'Misto', tet: 'Misto' }, price: 2.50 }
    ]
  },
  {
    id: 's-deus', categoryId: 'sandes', image: null,
    title: { en: 'Pão de Deus', pt: 'Pão de Deus', tet: 'Pão de Deus' },
    description: { en: 'Sweet bread topped with toasted coconut.', pt: 'Pão doce coberto com coco tostado.', tet: 'Paun midar ho nuu tunu.' },
    price: 1.80,
    variants: [
      { name: { en: 'Plain', pt: 'Simples', tet: 'Simples' }, price: 1.80 },
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 2.40 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.70 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.70 },
      { name: { en: 'Mixed', pt: 'Misto', tet: 'Misto' }, price: 2.95 }
    ]
  },

  // --- SPECIAL SANDWICHES & TOASTS ---
  {
    id: 'se-toast', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Toast', pt: 'Torrada', tet: 'Torrada' },
    description: { en: 'Thick slices of toasted bread with toppings.', pt: 'Fatias grossas de pão torrado com cobertura.', tet: 'Paun torrada.' },
    price: 1.00,
    variants: [
      { name: { en: '1/2 Butter', pt: '½ Torrada Manteiga', tet: '½ Torrada Manteiga' }, price: 1.00 },
      { name: { en: 'Full Butter', pt: 'Torrada Manteiga', tet: 'Torrada Manteiga' }, price: 1.90 },
      { name: { en: '1/2 Cheese', pt: '½ Tosta de Queijo', tet: '½ Tosta Keiju' }, price: 1.50 },
      { name: { en: 'Full Cheese', pt: 'Tosta de Queijo', tet: 'Tosta Keiju' }, price: 2.75 },
      { name: { en: '1/2 Ham', pt: '½ Tosta de Fiambre', tet: '½ Tosta Fiambre' }, price: 1.50 },
      { name: { en: 'Full Ham', pt: 'Tosta de Fiambre', tet: 'Tosta Fiambre' }, price: 2.75 },
      { name: { en: '1/2 Mixed', pt: '½ Tosta Mista', tet: '½ Tosta Mista' }, price: 1.65 },
      { name: { en: 'Full Mixed', pt: 'Tosta Mista', tet: 'Tosta Mista' }, price: 3.00 }
    ]
  },
  {
    id: 'se-omelet', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Omelette Sandwich', pt: 'Sandes Omelette', tet: 'Sande Omelette' },
    description: { en: 'Freshly made omelette in bread.', pt: 'Omelete feita na hora no pão.', tet: 'Omelete fresku iha paun.' },
    price: 1.95,
    variants: [
      { name: { en: '1/2 Sandwich', pt: 'Meia Sandes', tet: 'Meia Sandes' }, price: 1.95 },
      { name: { en: 'Full Sandwich', pt: 'Sandes Inteira', tet: 'Sande Tomak' }, price: 3.50 }
    ]
  },
  {
    id: 'se-tuna', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Tuna Sandwich', pt: 'Sandes de Atum', tet: 'Sande Atum' },
    description: { en: 'Tuna paste with fresh greens.', pt: 'Pasta de atum com folhas frescas.', tet: 'Pasta atum nian.' },
    price: 1.95,
    variants: [
      { name: { en: '1/2 Sandwich', pt: 'Meia Sandes', tet: 'Meia Sandes' }, price: 1.95 },
      { name: { en: 'Full Sandwich', pt: 'Sandes Inteira', tet: 'Sande Tomak' }, price: 3.50 }
    ]
  },
  {
    id: 'se-meatcutlet', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Breaded Meat Cutlet Sandwich', pt: 'Sandes de Panado de Carne', tet: 'Sandes de Panado de Carne' },
    description: { en: 'Crispy breaded meat cutlet in a roll.', pt: 'Panado de carne crocante no pão.', tet: 'Naan panadu krispi iha paun.' },
    price: 4.50
  },
  {
    id: 'se-fishcutlet', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Breaded Fish Cutlet Sandwich', pt: 'Sandes de Panado de Peixe', tet: 'Sandes de Panado de Peixe' },
    description: { en: 'Crispy breaded fish fillet in a roll.', pt: 'Filete de peixe panado no pão.', tet: 'Ikan panadu iha paun.' },
    price: 4.50
  },
  {
    id: 'se-bifana', categoryId: 'sandes-especiais', image: null,
    title: { en: 'Bifana', pt: 'Bifana', tet: 'Bifana' },
    description: { en: 'Traditional Portuguese marinated pork sandwich.', pt: 'Sandes tradicional de carne de porco marinada.', tet: 'Sande naan fahi Portugés nian.' },
    price: 4.00
  },

  // --- BARISTA ---
  { id: 'b-esp', categoryId: 'barista', image: null, price: 1.50, title: { en: 'Espresso', pt: 'Expresso', tet: 'Espresso' }, description: { en: 'Classic short black coffee.', pt: 'Café preto curto clássico.', tet: 'Kafé metan.' } },
  { id: 'b-desp', categoryId: 'barista', image: null, price: 2.00, title: { en: 'Double Espresso', pt: 'Expresso Duplo', tet: 'Espresso Duplu' }, description: { en: 'Double shot of espresso.', pt: 'Dupla dose de expresso.', tet: 'Espresso dala rua.' } },
  { id: 'b-decesp', categoryId: 'barista', image: null, price: 1.75, title: { en: 'Decaf Espresso', pt: 'Descafeinado', tet: 'Kafé Deskafeinadu' }, description: { en: 'Caffeine-free espresso.', pt: 'Expresso sem cafeína.', tet: 'Kafé la iha kafeina.' } },
  { id: 'b-capesp', categoryId: 'barista', image: null, price: 1.00, title: { en: 'Capsule Espresso', pt: 'Cápsula Expresso', tet: 'Kápsula Espresso' }, description: { en: 'Single origin capsule espresso.', pt: 'Expresso de cápsula.', tet: 'Kápsula espresso.' } },
  { id: 'b-mac', categoryId: 'barista', image: null, price: 1.75, title: { en: 'Espresso Macchiato', pt: 'Pingado', tet: 'Pingadu' }, description: { en: 'Espresso marked with a drop of milk.', pt: 'Expresso com uma gota de leite.', tet: 'Espresso ho susubeen oituan.' } },
  { id: 'b-cap', categoryId: 'barista', image: null, price: 2.50, title: { en: 'Cappuccino', pt: 'Cappuccino', tet: 'Cappuccino' }, description: { en: 'Espresso with steamed milk and thick foam.', pt: 'Expresso com leite vaporizado e espuma.', tet: 'Espresso ho susubeen frota.' } },
  { id: 'b-latte', categoryId: 'barista', image: null, price: 2.25, title: { en: 'Latte / Flat White', pt: 'Meia de Leite / Garoto', tet: 'Meia de Leite' }, description: { en: 'Milky espresso coffee.', pt: 'Café expresso com bastante leite.', tet: 'Kafé ho susubeen barak.' } },
  { id: 'b-carioca', categoryId: 'barista', image: null, price: 1.50, title: { en: 'Café Carioca', pt: 'Carioca', tet: 'Karioka' }, description: { en: 'Diluted, weaker espresso shot.', pt: 'Expresso fraco e diluído.', tet: 'Espresso fraku.' } },
  { id: 'b-americano', categoryId: 'barista', image: null, price: 1.50, title: { en: 'Americano / Long Black', pt: 'Café Americano', tet: 'Americano' }, description: { en: 'Espresso poured over hot water.', pt: 'Expresso sobre água quente.', tet: 'Espresso ho bee manas.' } },
  { id: 'b-milk', categoryId: 'barista', image: null, price: 1.00, title: { en: 'Glass of Milk', pt: 'Copo de Leite', tet: 'Kopu Susubeen' }, description: { en: 'Hot or cold glass of milk.', pt: 'Copo de leite quente ou frio.', tet: 'Kopu susubeen malirin ka manas.' } },
  { id: 'b-chocmilk', categoryId: 'barista', image: null, price: 1.70, title: { en: 'Chocolate Milk', pt: 'Copo de Leite c/ Chocolate', tet: 'Susubeen Xokolate' }, description: { en: 'Sweet chocolate milk.', pt: 'Leite com chocolate doce.', tet: 'Susubeen xokolate midar.' } },
  { id: 'b-tea', categoryId: 'barista', image: null, price: 2.00, title: { en: 'Tea', pt: 'Chá', tet: 'Chá' }, description: { en: 'Hot infused tea.', pt: 'Infusão de chá quente.', tet: 'Xá manas.' } },
  { id: 'b-teamilk', categoryId: 'barista', image: null, price: 2.25, title: { en: 'Tea with Milk', pt: 'Chá com Leite', tet: 'Chá com Leite' }, description: { en: 'Hot tea served with milk.', pt: 'Chá quente servido com leite.', tet: 'Xá manas ho susubeen.' } },

  // --- CROISSANTS ---
  {
    id: 'c-normal', categoryId: 'croissants', image: null,
    title: { en: 'Croissant', pt: 'Croissant', tet: 'Croissant' },
    description: { en: 'Flaky and buttery baked croissant.', pt: 'Croissant folhado e amanteigado.', tet: 'Kroisan amanteigadu.' },
    price: 1.50,
    variants: [
      { name: { en: 'Plain', pt: 'Simples', tet: 'Simples' }, price: 1.50 },
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 1.85 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.35 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.35 },
      { name: { en: 'Mixed', pt: 'Misto', tet: 'Misto' }, price: 2.50 }
    ]
  },
  {
    id: 'c-xl', categoryId: 'croissants', image: null,
    title: { en: 'XL Croissant', pt: 'Croissant XL', tet: 'Croissant XL' },
    description: { en: 'Extra large flaky croissant.', pt: 'Croissant folhado extra grande.', tet: 'Kroisan boot tebes.' },
    price: 2.30,
    variants: [
      { name: { en: 'Plain', pt: 'Simples', tet: 'Simples' }, price: 2.30 },
      { name: { en: 'Butter', pt: 'Manteiga', tet: 'Manteiga' }, price: 2.40 },
      { name: { en: 'Cheese', pt: 'Queijo', tet: 'Keiju' }, price: 2.70 },
      { name: { en: 'Ham', pt: 'Fiambre', tet: 'Fiambre' }, price: 2.70 },
      { name: { en: 'Mixed', pt: 'Misto', tet: 'Misto' }, price: 3.25 }
    ]
  },
  { id: 'c-brioche', categoryId: 'croissants', image: null, price: 2.00, title: { en: 'Brioche Croissant with Custard', pt: 'Croissant Brioche c/ Creme', tet: 'Croissant Brioche ho Kreme' }, description: { en: 'Soft brioche dough filled with custard.', pt: 'Massa de brioche recheada com creme.', tet: 'Kroisan brioxe mamar ho kreme.' } },
  { id: 'c-choc', categoryId: 'croissants', image: null, price: 2.00, title: { en: 'Chocolate Croissant', pt: 'Croissant de Chocolate', tet: 'Croissant Xokolate' }, description: { en: 'Filled with rich chocolate.', pt: 'Recheado com chocolate rico.', tet: 'Kroisan ho xokolate.' } },
  { id: 'c-puff', categoryId: 'croissants', image: null, price: 2.00, title: { en: 'Puff Pastry Croissant with Custard', pt: 'Croissant Folhado c/ Creme', tet: 'Croissant Folhadu ho Kreme' }, description: { en: 'Flaky pastry filled with egg custard.', pt: 'Massa folhada recheada com creme de ovo.', tet: 'Kroisan krispi ho kreme.' } },

  // --- PASTEIS E SALGADOS ---
  { id: 'ps-veg', categoryId: 'pasteis-salgados', image: null, price: 1.30, title: { en: 'Vegetarian Samosa', pt: 'Chamuça Vegetariana', tet: 'Samosa Vejetariana' }, description: { en: 'Crispy fried pastry filled with spiced veggies.', pt: 'Pastel frito recheado com vegetais.', tet: 'Samosa ho vejetais.' } },
  { id: 'ps-chicken', categoryId: 'pasteis-salgados', image: null, price: 1.75, title: { en: 'Chicken Samosa', pt: 'Chamuça de Frango', tet: 'Samosa Naan Manu' }, description: { en: 'Crispy fried pastry filled with chicken.', pt: 'Pastel frito recheado com frango.', tet: 'Samosa ho naan manu.' } },
  { id: 'ps-tuna', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Tuna Puff Pastry', pt: 'Folhado de Atum', tet: 'Folhadu Atum' }, description: { en: 'Puff pastry pocket with savory tuna filling.', pt: 'Folhado com recheio salgado de atum.', tet: 'Folhadu ho atum.' } },
  { id: 'ps-meat', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Meat Puff Pastry', pt: 'Folhado de Carne', tet: 'Folhadu Naan' }, description: { en: 'Puff pastry pocket with savory minced meat.', pt: 'Folhado com carne picada.', tet: 'Folhadu ho naan.' } },
  { id: 'ps-spinach', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Spinach Puff Pastry', pt: 'Folhado de Espinafres', tet: 'Folhadu Espinafre' }, description: { en: 'Puff pastry pocket with creamy spinach.', pt: 'Folhado com espinafres cremosos.', tet: 'Folhadu ho espinafre.' } },
  { id: 'ps-chickenpuff', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Chicken Puff Pastry', pt: 'Folhado de Frango', tet: 'Folhadu Naan Manu' }, description: { en: 'Puff pastry pocket with chicken filling.', pt: 'Folhado com recheio de frango.', tet: 'Folhadu ho naan manu.' } },
  { id: 'ps-pizza', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Pizza Puff Pastry', pt: 'Folhado de Pizza', tet: 'Folhadu Piza' }, description: { en: 'Cheese and oregano pizza pocket.', pt: 'Folhado de queijo e orégãos.', tet: 'Folhadu ho keiju no orégaun.' } },
  { id: 'ps-sausage', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Sausage & Cheese Puff Pastry', pt: 'Folhado Salsicha e Queijo', tet: 'Folhadu Salsixa no Keiju' }, description: { en: 'Sausage and melted cheese wrapped in pastry.', pt: 'Salsicha e queijo derretido em massa.', tet: 'Folhadu ho salsixa no keiju.' } },
  { id: 'ps-lanche', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Stuffed Bread', pt: 'Lanche', tet: 'Lanche' }, description: { en: 'Soft bread baked with ham and cheese inside.', pt: 'Pão macio com fiambre e queijo.', tet: 'Paun mamar ho fiambre no keiju.' } },
  { id: 'ps-panikecereal', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Mixed Cereal Panike', pt: 'Panike Cereal Misto', tet: 'Panike Sereal Misto' }, description: { en: 'Cereal dough pocket with ham and cheese.', pt: 'Massa de cereais com fiambre e queijo.', tet: 'Panike sereal ho fiambre no keiju.' } },
  { id: 'ps-panikemixed', categoryId: 'pasteis-salgados', image: null, price: 2.00, title: { en: 'Mixed Panike', pt: 'Panike Misto', tet: 'Panike Misto' }, description: { en: 'Puff pastry with ham and cheese.', pt: 'Massa folhada com fiambre e queijo.', tet: 'Panike folhadu ho fiambre no keiju.' } },
  {
    id: 'ps-rissol', categoryId: 'pasteis-salgados', image: null,
    title: { en: 'Rissol', pt: 'Rissol', tet: 'Rissol' },
    description: { en: 'Traditional Portuguese breaded and fried savory patty.', pt: 'Pastel panado e frito tradicional.', tet: 'Rissol panadu no fritu.' },
    price: 1.50,
    variants: [
      { name: { en: 'Meat', pt: 'Carne', tet: 'Naan' }, price: 1.50 },
      { name: { en: 'Fish', pt: 'Peixe', tet: 'Ikan' }, price: 1.50 }
    ]
  },

  // --- BOLOS E DOCES ---
  { id: 'bd-nata', categoryId: 'bolos-doces', image: null, price: 1.50, title: { en: 'Pastel de Nata', pt: 'Pastel de Nata', tet: 'Pastel de Nata' }, description: { en: 'Portuguese egg custard tart in flaky pastry.', pt: 'Pastel de nata tradicional português.', tet: 'Tarte manu-tolun Portugés.' } },
  { id: 'bd-chocnata', categoryId: 'bolos-doces', image: null, price: 1.80, title: { en: 'Pastel de Nata Chocolate', pt: 'Pastel de Nata Chocolate', tet: 'Pastel de Nata Xokolate' }, description: { en: 'Custard tart infused with rich chocolate.', pt: 'Pastel de nata com chocolate.', tet: 'Pastel nata ho xokolate.' } },
  { id: 'bd-arroz', categoryId: 'bolos-doces', image: null, price: 2.50, title: { en: 'Bolo de Arroz', pt: 'Bolo de Arroz', tet: 'Bolo de Arroz' }, description: { en: 'Sweet and buttery traditional rice flour cake.', pt: 'Bolo tradicional feito com farinha de arroz.', tet: 'Bolu tradisional husi farinha foos.' } },
  { id: 'bd-almond', categoryId: 'bolos-doces', image: null, price: 2.50, title: { en: 'Almond Bretzel', pt: 'Bretzel Amêndoa', tet: 'Bretzel Améndoa' }, description: { en: 'Sweet pastry shaped like a pretzel with almonds.', pt: 'Massa doce em forma de laço com amêndoas.', tet: 'Lasu midar ho améndoa.' } },
  { id: 'bd-apple', categoryId: 'bolos-doces', image: null, price: 2.50, title: { en: 'Alcobaça Apple Bretzel', pt: 'Bretzel Maçã Alcobaça', tet: 'Bretzel Masán' }, description: { en: 'Sweet pastry pretzel filled with regional apple.', pt: 'Laço recheado com maçã de Alcobaça.', tet: 'Lasu midar ho masán.' } },
  { id: 'bd-pecan', categoryId: 'bolos-doces', image: null, price: 2.50, title: { en: 'Maple Pecan', pt: 'Maple Pecan', tet: 'Maple Pecan' }, description: { en: 'Braided pastry with maple syrup and pecans.', pt: 'Trança folhada com xarope de ácer e nozes pecan.', tet: 'Transa folhadu ho noz pekan.' } },
  { id: 'bd-sugardonut', categoryId: 'bolos-doces', image: null, price: 1.50, title: { en: 'Dot\'s Sugar Donut', pt: 'Dot\'s Açucarado', tet: 'Donut Masin Midar' }, description: { en: 'Classic donut dusted with sugar.', pt: 'Donut clássico polvilhado com açúcar.', tet: 'Donut ho masin midar.' } },
  { id: 'bd-chocdonut', categoryId: 'bolos-doces', image: null, price: 1.50, title: { en: 'Dot\'s Dark Chocolate Donut', pt: 'Dot\'s Negrito', tet: 'Donut Xokolate' }, description: { en: 'Donut covered in rich dark chocolate.', pt: 'Donut coberto com chocolate negro.', tet: 'Donut ho xokolate metan.' } },
  { id: 'bd-glazeddonut', categoryId: 'bolos-doces', image: null, price: 1.50, title: { en: 'Dot\'s Classic Glace', pt: 'Dot\'s Classic Glace', tet: 'Dot\'s Classic Glace' }, description: { en: 'Sweet glazed donut ring.', pt: 'Donut clássico com cobertura doce.', tet: 'Donut midar glaseadu.' } },

  // --- BEBIDAS E COCKTAILS ---
  { id: 'bc-wine', categoryId: 'bebidas-cocktails', image: null, price: 2.50, title: { en: 'House Glass of Wine', pt: 'Copo de Vinho da Casa', tet: 'Copo de Vinho da Casa' }, description: { en: 'A glass of our selected house wine.', pt: 'Um copo do nosso vinho da casa.', tet: 'Tua-uvas husi uma.' } },
  { id: 'bc-ginjinha', categoryId: 'bebidas-cocktails', image: null, price: 2.00, title: { en: 'Ginjinha', pt: 'Ginjinha', tet: 'Ginjinha' }, description: { en: 'Traditional Portuguese cherry liqueur.', pt: 'Licor tradicional português de ginja.', tet: 'Likór tradisional husi ginja.' } },
  { id: 'bc-favaito', categoryId: 'bebidas-cocktails', image: null, price: 1.75, title: { en: 'Moscatel Favaito', pt: 'Moscatel Favaito', tet: 'Moscatel Favaito' }, description: { en: 'Sweet fortified muscat wine.', pt: 'Vinho doce moscatel.', tet: 'Tua-uvas midar moscatel.' } },
  { id: 'bc-aperol', categoryId: 'bebidas-cocktails', image: null, price: 6.00, title: { en: 'Aperol Spritz', pt: 'Aperol Spritz', tet: 'Aperol Spritz' }, description: { en: 'Refreshing Italian cocktail with prosecco.', pt: 'Cocktail italiano refrescante.', tet: 'Koktail fresku Italianu nian.' } },
  { id: 'bc-gin', categoryId: 'bebidas-cocktails', image: null, price: 9.00, title: { en: 'Premium Gin & Tonic', pt: 'Gin Tónico Premium', tet: 'Gin Tónico Premium' }, description: { en: 'Premium gin mixed with tonic water and botanicals.', pt: 'Gin premium com água tónica e botânicos.', tet: 'Gin di\'ak ho bee tóniku.' } },
  { id: 'bc-port', categoryId: 'bebidas-cocktails', image: null, price: 7.00, title: { en: 'Porto Tónico', pt: 'Porto Tónico', tet: 'Porto Tónico' }, description: { en: 'White port wine mixed with tonic water.', pt: 'Vinho do porto branco com água tónica.', tet: 'Tua-uvas Porto mutin ho bee tóniku.' } },
  { id: 'bc-whisky', categoryId: 'bebidas-cocktails', image: null, price: 4.00, title: { en: 'Whisky', pt: 'Whisky', tet: 'Whisky' }, description: { en: 'A shot of classic aged whisky.', pt: 'Uma dose de whisky envelhecido clássico.', tet: 'Whisky tuan klasiku.' } },
  { id: 'bc-cachaca', categoryId: 'bebidas-cocktails', image: null, price: 4.50, title: { en: 'Cachaça 51', pt: 'Cachaça 51', tet: 'Cachaça 51' }, description: { en: 'Popular Brazilian sugarcane spirit.', pt: 'Aguardente de cana brasileira popular.', tet: 'Bebida maka\'as husi tohu Brazil nian.' } }
];
