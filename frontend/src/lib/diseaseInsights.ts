/** Curated, user-facing context for PlantVillage-style class labels (Crop___Condition). */

export type DiseaseInsight = {
  headline: string;
  summary: string;
  whatToLookFor: string;
  whyItMatters: string;
};

const healthy = (crop: string): DiseaseInsight => ({
  headline: `${crop} looks healthy`,
  summary: `The model does not see strong disease patterns on this leaf. Continue routine scouting—early stress can still appear before symptoms spread.`,
  whatToLookFor: `Even color, intact margins, no oily spots, fuzz, or concentric rings.`,
  whyItMatters: `Healthy canopies support yield; catching problems in the next week still saves fruit and foliage.`,
});

export const DISEASE_INSIGHTS: Record<string, DiseaseInsight> = {
  Apple___Apple_scab: {
    headline: 'Apple scab (Venturia)',
    summary:
      'A common fungal disease that thrives in cool, wet springs. It scars fruit and defoliates trees, weakening next year’s bloom.',
    whatToLookFor: 'Olive-green velvety spots on leaves maturing to dark, scabby lesions; similar corky areas on fruit.',
    whyItMatters: 'Heavy infections reduce photosynthesis and marketable fruit—early fungicide timing and sanitation matter.',
  },
  Apple___Black_rot: {
    headline: 'Black rot on apple',
    summary:
      'Fungal disease that causes “frog-eye” leaf spots and mummified fruit. Spreads from dead wood and mummies left in the canopy.',
    whatToLookFor: 'Purple leaf spots with darker borders; rotted fruit that shrinks into black mummies.',
    whyItMatters: 'Wood infections act as a reservoir—pruning out cankers breaks the disease cycle.',
  },
  Apple___Cedar_apple_rust: {
    headline: 'Cedar–apple rust',
    summary:
      'Needs both juniper/cedar and apple hosts. Orange gelatinous galls on cedar release spores that infect apple leaves in spring.',
    whatToLookFor: 'Bright orange-yellow spots on upper apple leaves; tiny black dots in the spot center.',
    whyItMatters: 'Defoliation can reduce tree vigor; separating hosts or using resistant cultivars helps long term.',
  },
  Apple___healthy: healthy('Apple'),
  Blueberry___healthy: healthy('Blueberry'),
  Cherry___Powdery_mildew: {
    headline: 'Powdery mildew on cherry',
    summary:
      'Fungal coating on young tissue favors humid, mild conditions. It distorts leaves and can affect fruit finish.',
    whatToLookFor: 'White talcum-like patches on leaf undersides and shoots; curling or puckering.',
    whyItMatters: 'Early shoot protection preserves photosynthetic area during the critical fruit-sizing window.',
  },
  Cherry___healthy: healthy('Cherry'),
  Corn___Cercospora_leaf_spot: {
    headline: 'Cercospora leaf spot (corn)',
    summary:
      'Fungal leaf blight that starts low in the canopy. Yield loss rises when lesions reach the ear leaf before grain fill.',
    whatToLookFor: 'Small rectangular tan-gray lesions with reddish-brown borders—often in rows between veins.',
    whyItMatters: 'Keeping upper leaves green through silking protects kernel weight and stalk strength.',
  },
  Corn___Common_rust: {
    headline: 'Common rust (corn)',
    summary:
      'Rust pustules release wind-borne spores. Usually a late-season cosmetic issue unless hybrids are very susceptible.',
    whatToLookFor: 'Raised cinnamon-brown pustules on upper and lower leaf surfaces.',
    whyItMatters: 'Rarely catastrophic alone, but combined with other stresses it can accelerate senescence.',
  },
  Corn___Northern_Leaf_Blight: {
    headline: 'Northern corn leaf blight',
    summary:
      'Large cigar-shaped lesions under warm, wet weather can strip the canopy and cut yield on susceptible hybrids.',
    whatToLookFor: 'Elliptical gray-green lesions that turn tan with dark fungal streaks when humid.',
    whyItMatters: 'Hybrid resistance plus rotation/residue management are the backbone of control.',
  },
  Corn___healthy: healthy('Corn'),
  Grape___Black_rot: {
    headline: 'Black rot of grape',
    summary:
      'Aggressive fungal disease that mummies clusters and causes shot-hole leaves in humid vineyards.',
    whatToLookFor: 'Tan “eyespot” leaf lesions; berries turn brown then shrink into hard black mummies.',
    whyItMatters: 'Mummies reinfect each season—removing them and timing fungicides around bloom is key.',
  },
  Grape___Esca: {
    headline: 'Esca complex (grape)',
    summary:
      'A slow wood-invading disease complex showing chronic leaf “tiger stripes” and sudden vine collapse in summer.',
    whatToLookFor: 'Interveinal necrosis patterns, stunted shoots, and eventually apoplexy of apparently healthy vines.',
    whyItMatters: 'There is no cure—sanitation at pruning and avoiding large fresh wounds reduces spread risk.',
  },
  Grape___Leaf_blight: {
    headline: 'Grape leaf blight',
    summary:
      'Foliar blight diseases (including some Botryosphaeria-related patterns) reduce leaf area during ripening.',
    whatToLookFor: 'Irregular brown patches, sometimes with shot holes after tissue dies and falls out.',
    whyItMatters: 'Sugar accumulation depends on healthy leaves through véraison—protect the fruiting zone canopy.',
  },
  Grape___healthy: healthy('Grape'),
  Orange___Haunglongbing: {
    headline: 'Citrus greening (HLB)',
    summary:
      'Bacterium spread by psyllids causes asymmetric blotchy mottle and misshapen, bitter fruit—one of the world’s most serious citrus diseases.',
    whatToLookFor: 'Yellow blotches that cross veins asymmetrically; twig dieback and small, upright “tasteless” fruit.',
    whyItMatters: 'Vector control and removal of heavily infected trees are central—early detection slows neighborhood spread.',
  },
  Peach___Bacterial_spot: {
    headline: 'Bacterial spot on peach',
    summary:
      'Rain-splashed bacteria infect leaves and fruit, causing shot holes and cracking that invite rot.',
    whatToLookFor: 'Angular water-soaked spots on leaves; shallow dark pits or cracking on fruit.',
    whyItMatters: 'Fruit cracking downgrades packouts; copper programs and avoiding susceptible cultivars in wet sites help.',
  },
  Peach___healthy: healthy('Peach'),
  'Pepper,_bell___Bacterial_spot': {
    headline: 'Bacterial spot on pepper',
    summary:
      'Leaf and fruit spotting under warm, humid conditions; severe infections defoliate plants and sunscald fruit.',
    whatToLookFor: 'Small greasy spots with yellow halos on leaves; raised scabby lesions on pods.',
    whyItMatters: 'Seed treatment, drip irrigation, and avoiding working wet canopies limit spread.',
  },
  'Pepper,_bell___healthy': healthy('Bell pepper'),
  Potato___Early_blight: {
    headline: 'Early blight (Alternaria)',
    summary:
      'Target-like lesions often start on older leaves during stress. Can weaken plants before tuber bulking finishes.',
    whatToLookFor: 'Concentric rings inside tan-brown spots; yellow halos—typically bottom-up progression.',
    whyItMatters: 'Keeping foliage protected through canopy closure preserves tuber size and skin quality.',
  },
  Potato___Late_blight: {
    headline: 'Late blight (Phytophthora)',
    summary:
      'Fast, cool, wet epidemic disease famous for historical famines—still a priority pathogen in humid production.',
    whatToLookFor: 'Water-soaked patches turning brown; white sporulation at leaf edges in humid mornings.',
    whyItMatters: 'Tuber rot in storage starts from foliar infections—act quickly and use resistant varieties where possible.',
  },
  Potato___healthy: healthy('Potato'),
  Raspberry___healthy: healthy('Raspberry'),
  Soybean___healthy: healthy('Soybean'),
  Squash___Powdery_mildew: {
    headline: 'Powdery mildew on squash',
    summary:
      'White fungal coating on leaves reduces photosynthesis late in the season and can weaken plants before final fruit set.',
    whatToLookFor: 'White patches that don’t look water-soaked; leaves may crisp and silver.',
    whyItMatters: 'Shade-free airflow and timely fungicides or tolerant varieties preserve late harvests.',
  },
  Strawberry___Leaf_scorch: {
    headline: 'Strawberry leaf scorch',
    summary:
      'Fungal leaf spot complex that can co-occur with other leaf pathogens; severe spotting reduces runner vigor.',
    whatToLookFor: 'Small dark spots with purple halos; centers may fall out giving a “shot-hole” look.',
    whyItMatters: 'Clean planting stock and mulch to limit rain splash protect next year’s crown health.',
  },
  Strawberry___healthy: healthy('Strawberry'),
  Tomato___Bacterial_spot: {
    headline: 'Bacterial spot on tomato',
    summary:
      'Splashing rain spreads bacteria to leaves and fruit, causing speckling and cracking that downgrades market fruit.',
    whatToLookFor: 'Tiny dark specks with subtle yellow halos; fruit shows raised scabby pits.',
    whyItMatters: 'Fixed copper rotations and staking for airflow are standard—avoid overhead irrigation when possible.',
  },
  Tomato___Early_blight: {
    headline: 'Tomato early blight',
    summary:
      'Alternaria lesions create target spots and stem collar rot on stressed plants, working from the bottom leaves upward.',
    whatToLookFor: 'Bullseye lesions on older foliage; dark, sunken areas at soil line on susceptible varieties.',
    whyItMatters: 'Mulch, staking, and protecting the fruiting wall leaves supports yield through summer.',
  },
  Tomato___Late_blight: {
    headline: 'Tomato late blight',
    summary:
      'Phytophthora pathogen that destroys foliage in cool, wet spells and rots green fruit with firm brown patches.',
    whatToLookFor: 'Greasy irregular patches; fuzzy sporulation on undersides; firm chocolate blotches on fruit.',
    whyItMatters: 'Neighborhood-wide vigilance matters—remove infected tissue and rotate away from nightshade hosts.',
  },
  Tomato___Leaf_Mold: {
    headline: 'Tomato leaf mold',
    summary:
      'High-humidity greenhouse/ tunnel disease causing yellow patches on tops and olive mold below.',
    whatToLookFor: 'Yellow blotches above; velvety olive-green growth on leaf undersides.',
    whyItMatters: 'Ventilation and resistant varieties beat repeated fungicide use in enclosed production.',
  },
  Tomato___Septoria_leaf_spot: {
    headline: 'Septoria leaf spot',
    summary:
      'Tiny circular spots with dark borders pepper lower leaves, sometimes defoliating plants before harvest.',
    whatToLookFor: 'Small spots with dark margins and light centers; black pycnidia specks visible with magnification.',
    whyItMatters: 'Crop residue management and avoiding soil splash onto leaves slows early season buildup.',
  },
  Tomato___Spider_mites: {
    headline: 'Spider mite injury',
    summary:
      'Piercing-sucking mites stipple leaves; hot, dry weather favors explosive populations and fine webbing.',
    whatToLookFor: 'Speckled “sandpaper” leaves, bronzing, webbing along veins—often start near field edges.',
    whyItMatters: 'Predatory mites and avoiding broad-spectrum sprays that kill beneficials help keep balance.',
  },
  Tomato___Target_Spot: {
    headline: 'Target spot (tomato)',
    summary:
      'Fungal leaf spot with concentric rings; in humid climates it can join lesions and strip foliage.',
    whatToLookFor: 'Dark-centered spots with alternating rings; similar to early blight but often finer speckling inside.',
    whyItMatters: 'Canopy hygiene and fungicide timing align with other foliar tomato pathogens—scout weekly.',
  },
  Tomato___Yellow_Leaf_Curl_Virus: {
    headline: 'Tomato yellow leaf curl virus',
    summary:
      'Whitefly-transmitted virus causing severe stunting and flower drop—yield loss can be total in susceptible varieties.',
    whatToLookFor: 'Upright yellowed cupped leaves, stunted growth, aborted flowers.',
    whyItMatters: 'TYLCV-resistant cultivars and aggressive whitefly management are the practical foundation.',
  },
  Tomato___mosaic_virus: {
    headline: 'Tomato mosaic virus (ToMV/TMV group)',
    summary:
      'Mechanically transmitted viruses causing mottle and distortion; spreads on hands, tools, and smokers’ touch.',
    whatToLookFor: 'Mosaic light/dark green patterns, fern-leaf distortion, sometimes fruit brown wall.',
    whyItMatters: 'Seed sanitation, resistant varieties, and strict tool hygiene limit recurring losses.',
  },
  Tomato___healthy: healthy('Tomato'),
};

export function parseCropAndLabel(className: string): { crop: string; label: string } {
  const sep = className.indexOf('___');
  if (sep === -1) {
    return { crop: 'Crop', label: className.replace(/_/g, ' ') };
  }
  const crop = className.slice(0, sep).replace(/,/g, '');
  const label = className
    .slice(sep + 3)
    .replace(/_/g, ' ');
  return { crop, label };
}

export function getDiseaseInsight(className: string): DiseaseInsight {
  const direct = DISEASE_INSIGHTS[className];
  if (direct) return direct;
  const { crop, label } = parseCropAndLabel(className);
  if (/healthy/i.test(label)) return healthy(crop);
  return {
    headline: label,
    summary: `This label maps to ${crop} stress or disease patterns in the training set. Confirm in the field with local extension guidance—images alone are not a replacement for lab tests when stakes are high.`,
    whatToLookFor: 'Compare several leaves and plant stages; note lesion shape, color, and whether symptoms start low or high in the canopy.',
    whyItMatters: 'Correct ID drives legal chemistries, resistance traits, and quarantine decisions.',
  };
}
