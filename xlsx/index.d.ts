/// <reference path="../lib/jszip/jszip.d.ts" />
declare module "lib/jszip/jszip.min" {
    const _exports: any;
    export = _exports;
}
declare namespace xlsx {
    function parseSheet(text: string): string;
    function parseXLSX(data: ArrayBuffer, then: (value: string) => any): void;
}
