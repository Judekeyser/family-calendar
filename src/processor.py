document = []

with open('calendrier.tex', 'r') as f:
  lines = f .readlines()
  should_add_in_document = False

  for line in lines:
    if 'end{document}' in line:
      should_add_in_document = False
    if should_add_in_document:
      document.append (line)
    if 'begin{document}' in line:
      should_add_in_document = True

for line_doc in document:
  print(line_doc)
