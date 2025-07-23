export async function getChatCompletion(messages: { role: string; content: string }[]) {
  const res = await fetch('http://localhost:9099/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stream: true,
      messages,
      model: 'default'
    })
  });
  return res.body?.getReader();
}