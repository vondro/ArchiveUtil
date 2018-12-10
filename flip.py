src = open('grupa_zmiana.csv', 'r')
dst = open('grupa_dst.csv', 'w')

for line in src:
    line = line[0:-1]
    spl = line.split(' ')
    rev = spl[::-1]
    jn = ' '.join(rev)
    jn = jn+'\n'
    dst.writelines(jn)

dst.close()
src.close()
