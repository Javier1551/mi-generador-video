export async function generateVideo({
  prompt,
  image,
  style,
}: {
  prompt: string
  image: string | null
  style: string
}) {
  const res = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image, style }),
  })

  if (!res.ok) {
    throw new Error('Error en la generación')
  }
  return res.json()
}