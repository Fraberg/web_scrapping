const xlsxFile = require('read-excel-file/node');
 
xlsxFile('./levillagebyca_data.xlsx').then((rows) => {
    // console.table(rows);
    rows.forEach((col)=>{
        console.log(col[1]);
    })
})