

export const glowUpPromptMap: Record<string, string> = {
  average: `edit the person in this photo for average athletic body`,

  fit: `edit the person in this photo for fit athletic body`,

  lean: `

Edit this same person in the uploaded photo. Do not generate a different person.

Preserve the exact same face, identity, facial structure, hairstyle, skin tone, expression, pose, camera angle, framing, and overall scene.
Do not change age, jawline, nose, eyes, or hairstyle. Do not add or remove any existing facial hair. 
Do not change the style or type of clothes that they are wearing.

Make a clearly visible but realistic lean transformation:
- Reduce body fat, especially in the lower stomach area, face, arms, neck, etc. as necessary if its someone that is not already skinny / low body fat
- Slightly narrow the waist
- Flatten the stomach naturally
- Add only mild definition where realistically supported by the original body.
- If clothing is present, subtly reflect the leaner physique beneath the clothing while preserving realistic fabric behavior.

Keep proportions realistic:
- Maintain natural human proportions
- It should look attainable without steroids but still take 1 year to achieve. 

For people with higher body fat:
- Create a realistic 9–12 month fat-loss transformation
- Slim the face, jaw, neck, and cheeks naturally if body fat reduction would affect them
- Reduce belly size, waist width, chest fat, and arm fat
- Keep the person still naturally soft unless their original body shows visible muscle
- Do not create abs, sharp pec separation, or a muscular torso unless the original body already suggests that structure
- The result should look like the same person after losing weight, not like a different athletic model

If clothing is present:
- Preserve realistic clothing drape and fabric behavior
- Do not artificially outline abs or chest through shirts
- Avoid creating unrealistic tightness or compression in loose clothing
- Keep the clothing fit natural and believable

Preserve visual consistency:
- Keep the same lighting direction, shadows, contrast, and color temperature
- Maintain natural skin texture with no plastic or overly smooth skin
- Preserve clothing shape, fabric texture, and visible clothing details as much as possible
- Do not add tattoos, jewelry, accessories, or new clothing details.”

Preserve posture and composition:
- Keep the exact same body position and limb placement
- Do not change perspective, camera distance, or background

The result should look like the same real person, just leaner and more in shape.
Maintain full photorealism.
  `,

  shredded: `edit the person in this photo for shredded athletic body`,
};

export const getGlowUpPrompt = (level: string) => {
  return glowUpPromptMap[level] ?? glowUpPromptMap.lean;
};