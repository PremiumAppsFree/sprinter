# S Printer

পাসপোর্ট ফটো শিট, আইডি/আধার কার্ড প্রিন্ট, ফটো প্রিন্ট, ডকুমেন্ট ক্রপ আর PDF টুল।
সব কাজ ব্রাউজারেই হয়: কোনো লগইন, পেমেন্ট বা সার্ভার লাগে না।

## GitHub Pages-এ চালু করা
1. GitHub-এ একটা নতুন repository খুলুন (যেমন `sprinter`)।
2. এই ফোল্ডারের **ভেতরের সব ফাইল** (index.html, service/, tool/, assets/ ইত্যাদি, `.nojekyll` সহ) repository-র মূল জায়গায় আপলোড করুন।
3. Settings → Pages → Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)** → Save।
4. ১–২ মিনিট পর সাইট খুলবে: `https://<আপনার-username>.github.io/sprinter/`

## নিজের কম্পিউটারে চালানো
ফাইলে ডাবল-ক্লিক করে খুললে কিছু টুল কাজ করবে না। একটা ছোট সার্ভার চালান:
```
python -m http.server 8000
```
তারপর ব্রাউজারে খুলুন: http://localhost:8000

## জেনে রাখুন
- ইন্টারনেট লাগবে: স্টাইল, PDF লাইব্রেরি আর ব্যাকগ্রাউন্ড রিমুভের AI মডেল CDN থেকে আসে।
- প্রিন্টের সময় **Actual size / 100%** বেছে নিন, header/footer বন্ধ রাখুন।
- `assets/sprinter/sprinter.js` ফাইলটা মুছবেন না; পুরনো সার্ভারের কাজ এটাই ব্রাউজারে করে।
