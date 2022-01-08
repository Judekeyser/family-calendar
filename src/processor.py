class MapTrait:
  def __init__(self):
    self.name = None
    self.code_lines = []
    self.symbols = dict()

  def set_name (self, name):
    self.name = name

  def register_code_line (self, code_line):
    self.code_lines. append(code_line)

  def store_symbol (self, symbol, reference):
    self.symbols[symbol] = reference

  def symbol_list (self):
    return [(k, self.symbols[k]) for k in self.symbols]

class Definition(MapTrait):
  pass

class Deduction(MapTrait):
  pass

blocks = []

def ordered_blocks():
  mut_blocks = [[b, dict(b.symbols)] for b in blocks]
  ordered_blocks = []
  
  while len(mut_blocks) > 0:
    independent = None
    for N in range(0, len(mut_blocks)):
      independent = mut_blocks.pop()
      if len(independent[1]) == 0:
        independent = independent[0]
        for tup in mut_blocks:
          tup[1] = {k:v for k,v in tup[1].items() if v != independent.name}
        break
      else:
        mut_blocks.insert(0, independent)
        independent = None
    if independent is None:
      print("?????????")
      for b in ordered_blocks:
        print("%s (symbs: %s)" % (b.name, b.symbols))
      print("?????????")
      for b,s in mut_blocks:
        print("%s (symbs: %s ; unresolved = %s)" % (b.name, b.symbols,s))
      print("?????????")
      raise Exception("Unable to cover the graph: cycle detected")
    ordered_blocks.append(independent)

  return ordered_blocks

with open('source.tex', 'r') as f:
  lines = f .readlines()
  block = None
  in_code = False

  for line in lines:
    if block is None:
      if 'begin{definition}' in line:
        block = Definition()
      if 'begin{deduction}' in line:
        block = Deduction()
    else:
      if 'end{definition}' in line or 'end{deduction}' in line:
        blocks.append(block)
        block = None

    if block is not None:
      if 'label{' in line:
        label_ref = line[line.index('label{')+6:]
        label_ref = label_ref[:label_ref.index('}')]
        block .set_name (label_ref)

      if 'end{code}' in line:
        in_code = False
      if in_code:
        block .register_code_line(line)
      if 'begin{code}' in line:
        in_code = True

      while 'symboldef{' in line:
        line = line[line.index('symboldef{')+10:]
        symbol_part = line[:line.index('}')]
        line = line[line.index('{')+1:]
        reference_part = line[:line.index('}')]
        line = line[line.index('}')+1:]
        block .store_symbol(symbol_part, reference_part)


class JavaScriptPrinter:
  def __init__(self, block):
    self.block = block

  def __str__(self):
    lines = []
    self.__consume(lambda x:lines.append(x))
    return "".join(lines)

  def __consume(self, f):
    map_name = block.name
    args = block .symbol_list() 
    if len(args) == 0:
      start = end = ''
    else:
      loc_args = ','.join([k for k,_ in args])
      dep_args = ','.join([v for _,v in args])
      start = f"(function({loc_args}) {{\n return "
      end = f"}})({dep_args});"

    f(f"var {block.name} = {start}")
    for l in block.code_lines:
      f(l)
    f(f"{end}\n\n")
        
with open('calendrier.js', 'w') as f:
  for block in ordered_blocks():
    f.write(str(JavaScriptPrinter(block)))

