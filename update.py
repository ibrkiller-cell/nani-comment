import json
import re
import os

with open("input.txt", "r", encoding="utf-8") as f:
    text = f.read()

sections = text.split("### ")[1:]
category_keys = ["Enter", "Drink", "Music", "Banter", "Exit"]

new_data_objects = []

# Build emojis object (we don't really need it if everything is static, but keep it empty or minimal)
emojis_obj = """  emojis: {
    fun: ["✨", "💖", "🔥", "👍", "👀", "😆"]
  }"""
new_data_objects.append(emojis_obj)

for i, section in enumerate(sections):
    lines = section.strip().split("\n")[1:]
    items = []
    for line in lines:
        line = line.strip()
        if not line: continue
        m = re.match(r"\d+\.\s+(.*)", line)
        if m:
            item = m.group(1).replace('"', '\\"')
            items.append(f'      "{item}"')
    
    key = category_keys[i]
    items_str = ",\n".join(items)
    obj_str = f"""  {key}: {{
    type: "static",
    items: [
{items_str}
    ]
  }}"""
    new_data_objects.append(obj_str)

# Now read existing data.js to extract Quiz and SongQuiz
with open("js/data.js", "r", encoding="utf-8") as f:
    old_data = f.read()

quiz_match = re.search(r"  Quiz: \{.*?\],?\n  \},?", old_data, re.DOTALL)
song_quiz_match = re.search(r"  SongQuiz: \{.*?\],?\n  \}", old_data, re.DOTALL)

if quiz_match:
    new_data_objects.append(quiz_match.group(0).rstrip(","))
if song_quiz_match:
    new_data_objects.append(song_quiz_match.group(0))

new_data_content = "const dict = {\n" + ",\n\n".join(new_data_objects) + "\n};\n\nif (typeof window !== 'undefined') {\n  window.dict = dict;\n}\n"

with open("js/data.js", "w", encoding="utf-8") as f:
    f.write(new_data_content)

print("data.js updated successfully.")
