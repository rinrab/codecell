declare let module: any;
try {
    if (module) {
        module.exports ={
            Core,
            ExportTable
        }
    }
} catch (ex) { }
