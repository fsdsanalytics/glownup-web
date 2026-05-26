

export const glowUpPromptMap: Record<string, string> = {
  average: `edit the person in this photo for average athletic body`,

  fit: `edit the person in this photo for fit athletic body`,

  lean: `

Edit this same person in the uploaded photo. Do not generate a different person.

Preserve the exact same identity, face, facial structure, hairstyle, skin tone, expression, pose, camera angle, framing, body position, and overall scene.
The output must immediately look like the exact same real person.

Allow only realistic facial slimming caused by natural fat loss.
Do not significantly change facial proportions, age, ethnicity, gender presentation, or overall appearance.

Preserve the original facial appearance naturally.
Maintain the same approximate age, grooming, and overall facial appearance as the original image.
Only allow subtle facial changes that would naturally result from realistic fat loss.
Keep the hairstyle, facial softness, and overall identity consistent with the original person.

Do not add chest hair, tattoos, jewelry, accessories, logos, or new clothing details.
Do not change the style or type of clothing.

Create a clearly visible but realistic lean transformation.

---

Determine the person's approximate starting body composition and apply ONLY the matching transformation instructions below.
Ignore all instructions for body types that do not match the person.

If the person is naturally skinny or already low body fat:
- Add mild natural muscle definition
- Slightly improve the chest, shoulders, arms, and upper torso
- Keep the physique naturally lean and attainable
- Avoid dramatic muscle size increases
- Avoid oversized shoulders or exaggerated V-taper physiques

If the person has an average build:
- Reduce moderate body fat naturally
- Slightly narrow the waist
- Flatten the stomach naturally
- Add subtle athletic definition to the chest, shoulders, arms, and upper abs
- Create a realistic lean and athletic physique
- Avoid overly muscular or fitness-model physiques

If the person is overweight:
- Prioritize realistic fat loss over muscle gain
- Reduce body fat naturally in the stomach, waist, chest, face, neck, and arms
- Slightly reduce overall body size and thickness
- Create a leaner and healthier version of the same person
- Add only moderate natural muscle definition
- Keep the physique athletic but not highly muscular
- Avoid visible abs unless realistically supported by the original body
- Avoid oversized shoulders, large arms, exaggerated chest definition, or bodybuilder proportions
- The result should look like someone who lost weight and trained consistently for about 1 year

If the person is obese or carries very high body fat:
- Focus primarily on realistic long-term fat loss
- Reduce overall body size, torso thickness, waist width, chest fat, and face fullness
- Keep the person naturally broad/heavy after the transformation, just noticeably healthier and leaner
- Add only mild muscle improvement
- Avoid visible abs, highly defined muscles, exaggerated V-taper physiques, or bodybuilder proportions
- The transformation should look realistic, natural, and attainable
- The result should look like the same person after major weight loss, not like a fitness influencer or model

---

If clothing is present:
- Preserve realistic clothing drape and fabric behavior
- Subtly reflect the leaner physique beneath the clothing while keeping the clothing natural and believable
- Do not artificially outline abs or chest through shirts
- Avoid unrealistic tightness or compression in loose clothing
- Preserve realistic folds, wrinkles, and fabric thickness

Keep proportions realistic:
- Maintain natural human proportions
- Avoid fitness-model, superhero, or steroid-like physiques
- The transformation should look realistically attainable within about 1 year

Preserve visual consistency:
- Keep the same lighting direction, shadows, contrast, and color temperature
- Maintain natural skin texture with no plastic or overly smooth skin
- Preserve clothing shape, fabric texture, and visible clothing details as much as possible
- Preserve the original smartphone-camera realism and photo quality
- Avoid artificial skin glow, excessive sharpness, cinematic lighting, or editorial-style image changes

Preserve posture and composition:
- Keep the exact same body position and limb placement
- Do not change perspective, camera distance, image crop, or background
- Do not alter hand or finger structure
- Do not change the size of the head relative to the body

Prioritize identity preservation over transformation intensity.

The result should look like the same real person, just leaner, healthier, and more in shape.
Maintain full photorealism.

`,

  shredded: `edit the person in this photo for shredded athletic body`,
};

export const getGlowUpPrompt = (level: string) => {
  return glowUpPromptMap[level] ?? glowUpPromptMap.lean;
};