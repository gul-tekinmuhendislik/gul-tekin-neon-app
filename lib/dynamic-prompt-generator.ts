import { sql } from "./db";

// Interfaces
interface DynamicPromptConfig {
  topic: string;
  keywords?: string[];
  forceNewCombination?: boolean;
  seed?: string; // For reproducible randomness if needed
}

interface PromptComponents {
  colorScheme: Record<string, unknown> | null;
  visualElements: Record<string, unknown>[];
  compositionRule: Record<string, unknown> | null;
  stylePreset: Record<string, unknown> | null;
  regionalTheme?: Record<string, unknown> | null;
  negativePrompts: Record<string, unknown>[];
  timeBasedVariation: string;
}

// Time-based variation generator
function getTimeBasedVariation(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) return "dawn lighting, soft morning glow";
  if (hour >= 8 && hour < 11) return "morning light, fresh atmosphere";
  if (hour >= 11 && hour < 14) return "midday sun, bright clear light";
  if (hour >= 14 && hour < 17) return "afternoon warmth, golden tones";
  if (hour >= 17 && hour < 20) return "golden hour, sunset ambiance";
  if (hour >= 20 && hour < 23) return "evening mood, artificial lights";
  return "night atmosphere, neon glows, city lights";
}

// Random selector with weights
function weightedRandomSelect<T extends { weight?: number }>(items: T[]): T {
  if (items.length === 0) throw new Error("No items to select from");

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 100), 0);

  // Random number between 0 and totalWeight
  let random = Math.random() * totalWeight;

  // Find the selected item
  for (const item of items) {
    random -= (item.weight || 100);
    if (random <= 0) return item;
  }

  return items[items.length - 1]; // Fallback
}

// Generate unique combination hash
function generateCombinationHash(components: PromptComponents): string {
  return `${components.colorScheme?.id}_${components.stylePreset?.id}_${components.compositionRule?.id}_${new Date().getHours()}`;
}

// Main dynamic prompt generator
export async function generateDynamicPrompt(config: DynamicPromptConfig) {
  try {
    // 1. Get topic key for database queries
    const topicTranslations: Record<string, string> = {
      "Su Arıtma Sistemleri": "water_purification",
      "Isı Pompası": "heat_pump",
      "Güneş Paneli": "solar_panel",
      "Klima Sistemleri": "air_conditioning",
      "Yerden Isıtma": "underfloor_heating",
      "Hidrofor": "water_booster",
      "Neon Tabela": "neon_signage",
      "LED Tabela": "led_display"
    };

    const topicKey = topicTranslations[config.topic] || config.topic.toLowerCase().replace(/\s+/g, '_');

    // 2. Fetch all components with randomization
    const [
      colorSchemes,
      visualElements,
      compositionRules,
      stylePresets,
      regionalThemes,
      negativePrompts
    ] = await Promise.all([
      // Random color scheme
      sql`
        SELECT * FROM color_schemes
        WHERE (topic_key = ${topicKey} OR topic_key = 'default')
        AND is_active = true
        ORDER BY RANDOM()
        LIMIT 3
      `,

      // Random visual elements (mix of types)
      sql`
        SELECT * FROM visual_elements
        WHERE (topic_key = ${topicKey} OR topic_key IS NULL)
        AND is_active = true
        ORDER BY RANDOM()
        LIMIT 5
      `,

      // Random composition rule
      sql`
        SELECT * FROM composition_rules
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 2
      `,

      // Random style preset
      sql`
        SELECT * FROM style_presets
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 3
      `,

      // Check for regional keywords - simplified approach
      Promise.resolve([]),

      // Get negative prompts by category
      sql`
        SELECT * FROM negative_prompts
        WHERE is_active = true
        ORDER BY severity DESC, RANDOM()
      `
    ]);

    // 3. Select components using weighted random
    const components: PromptComponents = {
      colorScheme: colorSchemes.length > 0 ? weightedRandomSelect(colorSchemes) : null,
      visualElements: visualElements.slice(0, 3), // Take 3 random elements
      compositionRule: compositionRules.length > 0 ? weightedRandomSelect(compositionRules) : null,
      stylePreset: stylePresets.length > 0 ? weightedRandomSelect(stylePresets) : null,
      regionalTheme: regionalThemes.length > 0 ? regionalThemes[0] : null,
      negativePrompts: negativePrompts.slice(0, 5), // Top 5 negative prompts
      timeBasedVariation: getTimeBasedVariation()
    };

    // 4. Check if we've used this combination recently (optional)
    const combinationHash = generateCombinationHash(components);

    // Store combination hash to avoid repeats (you can implement this with a cache table)
    if (config.forceNewCombination) {
      // Check recent_prompts table and regenerate if needed
      const recentCheck = await sql`
        SELECT id FROM recent_prompts
        WHERE combination_hash = ${combinationHash}
        AND created_at > NOW() - INTERVAL '1 hour'
      `;

      if (recentCheck.length > 0) {
        // Recursively call with different seed
        return generateDynamicPrompt({
          ...config,
          seed: Math.random().toString()
        });
      }
    }

    // 5. Build the dynamic prompt
    const prompt = buildPromptFromComponents(components, config);

    // 6. Log the combination for tracking
    await sql`
      INSERT INTO recent_prompts (combination_hash, topic, created_at)
      VALUES (${combinationHash}, ${config.topic}, NOW())
      ON CONFLICT (combination_hash)
      DO UPDATE SET created_at = NOW()
    `;

    return {
      prompt: prompt.main,
      negativePrompt: prompt.negative,
      metadata: {
        colorScheme: components.colorScheme?.name,
        style: components.stylePreset?.name,
        composition: components.compositionRule?.name,
        regional: components.regionalTheme?.region_name,
        timeVariation: components.timeBasedVariation,
        combinationHash
      }
    };

  } catch (error) {
    console.error("Error generating dynamic prompt:", error);
    throw error;
  }
}

// Build prompt from components
function buildPromptFromComponents(components: PromptComponents, config: DynamicPromptConfig) {
  const {
    colorScheme,
    visualElements,
    compositionRule,
    stylePreset,
    regionalTheme,
    negativePrompts,
    timeBasedVariation
  } = components;

  // Build visual elements string
  const visualElementsStr = visualElements
    .map(ve => 'description' in ve ? ve.description : '')
    .filter(desc => desc)
    .join(", ");

  // Build color gradient
  const colorGradient = colorScheme && 'primary_gradient' in colorScheme
    ? `${(colorScheme.primary_gradient as string[])[0]} to ${(colorScheme.primary_gradient as string[])[1]} to ${(colorScheme.primary_gradient as string[])[2]} to ${(colorScheme.primary_gradient as string[])[3]}`
    : "#00D4FF to #FF00D4 to #D4FF00 to #FF7700";

  // Build main prompt
  let mainPrompt = `${config.topic} visualization, `;

  // Add style
  if (stylePreset && 'main_style' in stylePreset) {
    mainPrompt += `${stylePreset.main_style}, `;
    if ('render_style' in stylePreset && stylePreset.render_style) {
      mainPrompt += `${stylePreset.render_style}, `;
    }
  }

  // Add visual elements
  if (visualElementsStr) {
    mainPrompt += `featuring ${visualElementsStr}, `;
  }

  // Add composition
  if (compositionRule && 'layout_description' in compositionRule) {
    mainPrompt += `${compositionRule.layout_description}, `;
    if ('focal_point' in compositionRule) {
      mainPrompt += `${compositionRule.focal_point}, `;
    }
  }

  // Add colors
  mainPrompt += `color scheme: ${colorGradient}, `;
  if (colorScheme && 'accent_colors' in colorScheme && colorScheme.accent_colors) {
    mainPrompt += `accent colors: ${(colorScheme.accent_colors as string[]).join(", ")}, `;
  }

  // Add regional elements
  if (regionalTheme && 'visual_elements' in regionalTheme) {
    mainPrompt += `${regionalTheme.visual_elements}, `;
    if ('cultural_motifs' in regionalTheme) {
      mainPrompt += `${regionalTheme.cultural_motifs}, `;
    }
  }

  // Add time-based variation
  mainPrompt += `${timeBasedVariation}, `;

  // Add technical requirements
  mainPrompt += "high resolution, professional quality, ultra-detailed, optimized for web display";

  // Build negative prompt
  const negativePrompt = negativePrompts
    .map(np => 'prompt_text' in np ? np.prompt_text : '')
    .filter(text => text)
    .join(", ");

  return {
    main: mainPrompt,
    negative: negativePrompt || "low quality, blurry, pixelated, text, watermark"
  };
}

// Hourly variation generator (for cron jobs)
export async function generateHourlyVariations(topic: string) {
  const variations = [];

  for (let i = 0; i < 3; i++) {
    const result = await generateDynamicPrompt({
      topic,
      forceNewCombination: true
    });

    variations.push(result);

    // Small delay to ensure different random selections
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return variations;
}

// Create tracking table for recent combinations
export async function createPromptTrackingTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS recent_prompts (
      id SERIAL PRIMARY KEY,
      combination_hash VARCHAR(255) UNIQUE,
      topic VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create index for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_recent_prompts_created
    ON recent_prompts(created_at DESC)
  `;

  // Clean up old entries (older than 24 hours)
  await sql`
    DELETE FROM recent_prompts
    WHERE created_at < NOW() - INTERVAL '24 hours'
  `;
}