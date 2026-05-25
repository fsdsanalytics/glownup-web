

export const glowUpPromptMap: Record<string, string> = {
  average: `edit the person in this photo for average athletic body`,

  fit: `edit the person in this photo for fit athletic body`,

  lean: `

Edit this same person in the uploaded photo. Do not generate a different person.

Preserve the exact same face, identity, facial structure, hairstyle, skin tone, expression, pose, camera angle, framing, and overall scene.
Do not change age, jawline, nose, eyes, hairstyle, ethnicity, or facial proportions.
Do not add or remove any existing facial hair.
Do not change the style or type of clothes that they are wearing.
Do not add tattoos, jewelry, accessories, or new clothing details.

Create a clearly visible but realistic lean transformation.

Adjust the transformation realistically based on the person's starting body composition:

If the person is naturally skinny or low body fat:
- Add mild natural muscle definition
- Slightly improve chest, shoulders, arms, and upper torso
- Keep the physique naturally lean and attainable
- Avoid dramatic muscle size increases

If the person has an average build:
- Reduce moderate body fat naturally
- Slightly narrow the waist
- Flatten the stomach naturally
- Add subtle athletic definition to the chest, shoulders, arms, and upper abs
- Create a realistic lean and athletic physique

If the person is overweight:
- Prioritize realistic fat loss over muscle gain
- Reduce body fat in the stomach, waist, chest, face, neck, and arms
- Slim the face, jaw, neck, and cheeks naturally
- Keep muscle definition modest and realistic
- Avoid visible abs or highly muscular features unless naturally supported by the original body
- The result should look like the same person after losing weight, not like a different athletic model

If the person is obese or carries very high body fat:
- Simulate realistic long-term weight loss over roughly 9–18 months
- Reduce overall body size naturally
- Slim the stomach, waist, chest, face, neck, and arms
- Keep the body naturally soft and realistic
- Avoid visible abs, sharp muscle separation, or bodybuilder features
- Focus on realistic weight loss rather than muscle gain

If clothing is present:
- Preserve realistic clothing drape and fabric behavior
- Subtly reflect the leaner physique beneath the clothing while keeping the clothing natural and believable
- Do not artificially outline abs or chest through shirts
- Avoid unrealistic tightness or compression in loose clothing

Keep proportions realistic:
- Maintain natural human proportions
- Avoid fitness-model, superhero, or steroid-like physiques
- The transformation should look realistically attainable within about 1 year

Preserve visual consistency:
- Keep the same lighting direction, shadows, contrast, and color temperature
- Maintain natural skin texture with no plastic or overly smooth skin
- Preserve clothing shape, fabric texture, and visible clothing details as much as possible
- Avoid artificial skin glow or unrealistic sharpness

Preserve posture and composition:
- Keep the exact same body position and limb placement
- Do not change perspective, camera distance, image crop, or background
- Do not alter hand or finger structure
- Do not change the size of the head relative to the body

The result should look like the same real person, just leaner, healthier, and more in shape.
Maintain full photorealism.

`,

  shredded: `edit the person in this photo for shredded athletic body`,
};

export const getGlowUpPrompt = (level: string) => {
  return glowUpPromptMap[level] ?? glowUpPromptMap.lean;
};