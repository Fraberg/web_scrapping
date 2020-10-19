
import xlsxwriter

class Comp:
    def __init__(self, name, desc, hashtag, site):
        self.name = name
        self.desc = desc
        self.hashtag = hashtag
        self.site = site
    def reset(self):
        self.name = ""
        self.desc = ""
        self.hashtag = ""
        self.site = ""


filename = "CA.txt"
workbook = xlsxwriter.Workbook('levillagebyca_data.xlsx')
worksheet = workbook.add_worksheet('levillagebyca data')
row = 0
col = 0
worksheet.write(row, col, 'Name')
col = col + 1
worksheet.write(row, col, 'Desc')
col = col + 1
worksheet.write(row, col, 'Hashtag')
col = col + 1
worksheet.write(row, col, 'Site')
try:
    with open(filename, 'r') as f:
        c = Comp("", "", "", "")
        for value in f.readlines():
            # 1 trim ws
            value = value.strip()
            # 2 parse
            if not value: # value is empty
                pass
            else:
                print(value)
                if value.startswith("http"):
                    c.site = value;
                    row = row + 1
                    col = 0
                    worksheet.write(row, col, c.name)
                    col = col + 1
                    worksheet.write(row, col, c.desc)
                    col = col + 1
                    worksheet.write(row, col, c.hashtag)
                    col = col + 1
                    worksheet.write(row, col, c.site)
                    c.reset()
                elif not c.name:
                    c.name = value 
                elif value.startswith("#"):
                    if not c.hashtag:
                        c.hashtag = value
                    else:
                        c.hashtag = c.hashtag + " " + value
                elif not c.desc:
                    if not c.desc:
                        c.desc = value
                    else:
                        c.desc = c.desc + " " + value
        workbook.close()

except Exception as e:
    print(e)
