async function test() {
  console.log("Testing 3001 directly:");
  try {
    const r1 = await fetch('http://localhost:3001/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    console.log("3001 status:", r1.status);
    const text1 = await r1.text();
    console.log("3001 body:", text1);
  } catch (e) {
    console.log("3001 error:", e.message);
  }

  console.log("\nTesting 3000 (Gateway):");
  try {
    const r2 = await fetch('http://localhost:3000/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    console.log("3000 status:", r2.status);
    const text2 = await r2.text();
    console.log("3000 body:", text2);
  } catch (e) {
    console.log("3000 error:", e.message);
  }
}
test();
