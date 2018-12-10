grupa_src = open('few.csv', 'r')

# make dictionary from grupa_src where key = name of the person
src_dict = {}
for line in grupa_src:
    line = line[:-1]
    if line == '':
        break
    splitted = line.split(',')
        
    src_dict[splitted[1]] = splitted[0]
    
grupa_src.close()

grupa_dst = open('grupa_dst.csv', 'r')
# match grupa_dst with the dictionary and generate output string

output_ids = ''
output_names = ''


for line in grupa_dst:
    line = line[:-1]
    result = src_dict.get(line)
    if result != None:
        output_ids += result + ', '
        # output_ids += ', '
        output_names += line + '\n'
grupa_dst.close()

print(output_ids)
print(output_names)

matched_dst = open('matched.txt', 'w')
matched_dst.write(output_ids)
matched_dst.write('\n\n')
matched_dst.write(output_names)
