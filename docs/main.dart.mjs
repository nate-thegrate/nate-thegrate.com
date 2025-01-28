
// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _1: (x0,x1,x2) => x0.set(x1,x2),
      _2: (x0,x1,x2) => x0.set(x1,x2),
      _6: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._6(f,arguments.length,x0) }),
      _7: x0 => new window.FinalizationRegistry(x0),
      _8: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _9: (x0,x1) => x0.unregister(x1),
      _10: (x0,x1,x2) => x0.slice(x1,x2),
      _11: (x0,x1) => x0.decode(x1),
      _12: (x0,x1) => x0.segment(x1),
      _13: () => new TextDecoder(),
      _14: x0 => x0.buffer,
      _15: x0 => x0.wasmMemory,
      _16: () => globalThis.window._flutter_skwasmInstance,
      _17: x0 => x0.rasterStartMilliseconds,
      _18: x0 => x0.rasterEndMilliseconds,
      _19: x0 => x0.imageBitmaps,
      _192: x0 => x0.select(),
      _193: (x0,x1) => x0.append(x1),
      _194: x0 => x0.remove(),
      _197: x0 => x0.unlock(),
      _202: x0 => x0.getReader(),
      _211: x0 => new MutationObserver(x0),
      _222: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _223: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _226: x0 => new ResizeObserver(x0),
      _229: (x0,x1) => new Intl.Segmenter(x0,x1),
      _230: x0 => x0.next(),
      _231: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _308: x0 => x0.close(),
      _309: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _310: x0 => new window.ImageDecoder(x0),
      _311: x0 => x0.close(),
      _312: x0 => ({frameIndex: x0}),
      _313: (x0,x1) => x0.decode(x1),
      _316: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._316(f,arguments.length,x0) }),
      _317: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._317(f,arguments.length,x0) }),
      _318: (x0,x1) => ({addView: x0,removeView: x1}),
      _319: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._319(f,arguments.length,x0) }),
      _320: f => finalizeWrapper(f, function() { return dartInstance.exports._320(f,arguments.length) }),
      _321: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _322: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._322(f,arguments.length,x0) }),
      _323: x0 => ({runApp: x0}),
      _324: x0 => new Uint8Array(x0),
      _326: x0 => x0.preventDefault(),
      _327: x0 => x0.stopPropagation(),
      _328: (x0,x1) => x0.addListener(x1),
      _329: (x0,x1) => x0.removeListener(x1),
      _330: (x0,x1) => x0.prepend(x1),
      _331: x0 => x0.remove(),
      _332: x0 => x0.disconnect(),
      _333: (x0,x1) => x0.addListener(x1),
      _334: (x0,x1) => x0.removeListener(x1),
      _335: x0 => x0.blur(),
      _336: (x0,x1) => x0.append(x1),
      _337: x0 => x0.remove(),
      _338: x0 => x0.stopPropagation(),
      _342: x0 => x0.preventDefault(),
      _343: (x0,x1) => x0.append(x1),
      _344: x0 => x0.remove(),
      _345: x0 => x0.preventDefault(),
      _350: (x0,x1) => x0.removeChild(x1),
      _351: (x0,x1) => x0.appendChild(x1),
      _352: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _353: (x0,x1) => x0.appendChild(x1),
      _354: (x0,x1) => x0.transferFromImageBitmap(x1),
      _355: (x0,x1) => x0.appendChild(x1),
      _356: (x0,x1) => x0.append(x1),
      _357: (x0,x1) => x0.append(x1),
      _358: (x0,x1) => x0.append(x1),
      _359: x0 => x0.remove(),
      _360: x0 => x0.remove(),
      _361: x0 => x0.remove(),
      _362: (x0,x1) => x0.appendChild(x1),
      _363: (x0,x1) => x0.appendChild(x1),
      _364: x0 => x0.remove(),
      _365: (x0,x1) => x0.append(x1),
      _366: (x0,x1) => x0.append(x1),
      _367: x0 => x0.remove(),
      _368: (x0,x1) => x0.append(x1),
      _369: (x0,x1) => x0.append(x1),
      _370: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _371: (x0,x1) => x0.append(x1),
      _372: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _373: x0 => x0.remove(),
      _374: (x0,x1) => x0.append(x1),
      _375: x0 => x0.remove(),
      _376: (x0,x1) => x0.append(x1),
      _377: x0 => x0.remove(),
      _378: x0 => x0.remove(),
      _379: x0 => x0.getBoundingClientRect(),
      _380: x0 => x0.remove(),
      _393: (x0,x1) => x0.append(x1),
      _394: x0 => x0.remove(),
      _395: (x0,x1) => x0.append(x1),
      _396: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _397: x0 => x0.preventDefault(),
      _398: x0 => x0.preventDefault(),
      _399: x0 => x0.preventDefault(),
      _400: x0 => x0.preventDefault(),
      _401: (x0,x1) => x0.observe(x1),
      _402: x0 => x0.disconnect(),
      _403: (x0,x1) => x0.appendChild(x1),
      _404: (x0,x1) => x0.appendChild(x1),
      _405: (x0,x1) => x0.appendChild(x1),
      _406: (x0,x1) => x0.append(x1),
      _407: x0 => x0.remove(),
      _408: (x0,x1) => x0.append(x1),
      _409: (x0,x1) => x0.append(x1),
      _410: (x0,x1) => x0.appendChild(x1),
      _411: (x0,x1) => x0.append(x1),
      _412: x0 => x0.remove(),
      _413: (x0,x1) => x0.append(x1),
      _414: x0 => x0.remove(),
      _418: (x0,x1) => x0.appendChild(x1),
      _419: x0 => x0.remove(),
      _975: () => globalThis.window.flutterConfiguration,
      _976: x0 => x0.assetBase,
      _981: x0 => x0.debugShowSemanticsNodes,
      _982: x0 => x0.hostElement,
      _983: x0 => x0.multiViewEnabled,
      _984: x0 => x0.nonce,
      _986: x0 => x0.fontFallbackBaseUrl,
      _992: x0 => x0.console,
      _993: x0 => x0.devicePixelRatio,
      _994: x0 => x0.document,
      _995: x0 => x0.history,
      _996: x0 => x0.innerHeight,
      _997: x0 => x0.innerWidth,
      _998: x0 => x0.location,
      _999: x0 => x0.navigator,
      _1000: x0 => x0.visualViewport,
      _1001: x0 => x0.performance,
      _1004: (x0,x1) => x0.dispatchEvent(x1),
      _1006: (x0,x1) => x0.matchMedia(x1),
      _1008: (x0,x1) => x0.getComputedStyle(x1),
      _1009: x0 => x0.screen,
      _1010: (x0,x1) => x0.requestAnimationFrame(x1),
      _1011: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1011(f,arguments.length,x0) }),
      _1016: (x0,x1) => x0.warn(x1),
      _1019: (x0,x1) => x0.debug(x1),
      _1020: () => globalThis.window,
      _1021: () => globalThis.Intl,
      _1022: () => globalThis.Symbol,
      _1025: x0 => x0.clipboard,
      _1026: x0 => x0.maxTouchPoints,
      _1027: x0 => x0.vendor,
      _1028: x0 => x0.language,
      _1029: x0 => x0.platform,
      _1030: x0 => x0.userAgent,
      _1031: x0 => x0.languages,
      _1032: x0 => x0.documentElement,
      _1033: (x0,x1) => x0.querySelector(x1),
      _1037: (x0,x1) => x0.createElement(x1),
      _1038: (x0,x1) => x0.execCommand(x1),
      _1041: (x0,x1) => x0.createTextNode(x1),
      _1042: (x0,x1) => x0.createEvent(x1),
      _1046: x0 => x0.head,
      _1047: x0 => x0.body,
      _1048: (x0,x1) => x0.title = x1,
      _1051: x0 => x0.activeElement,
      _1053: x0 => x0.visibilityState,
      _1054: x0 => x0.hasFocus(),
      _1055: () => globalThis.document,
      _1056: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1057: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1060: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1060(f,arguments.length,x0) }),
      _1061: x0 => x0.target,
      _1063: x0 => x0.timeStamp,
      _1064: x0 => x0.type,
      _1066: x0 => x0.preventDefault(),
      _1068: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _1075: x0 => x0.firstChild,
      _1080: x0 => x0.parentElement,
      _1082: x0 => x0.parentNode,
      _1085: (x0,x1) => x0.removeChild(x1),
      _1086: (x0,x1) => x0.removeChild(x1),
      _1087: x0 => x0.isConnected,
      _1088: (x0,x1) => x0.textContent = x1,
      _1090: (x0,x1) => x0.contains(x1),
      _1096: x0 => x0.firstElementChild,
      _1098: x0 => x0.nextElementSibling,
      _1099: x0 => x0.clientHeight,
      _1100: x0 => x0.clientWidth,
      _1101: x0 => x0.offsetHeight,
      _1102: x0 => x0.offsetWidth,
      _1103: x0 => x0.id,
      _1104: (x0,x1) => x0.id = x1,
      _1107: (x0,x1) => x0.spellcheck = x1,
      _1108: x0 => x0.tagName,
      _1109: x0 => x0.style,
      _1111: (x0,x1) => x0.append(x1),
      _1112: (x0,x1) => x0.getAttribute(x1),
      _1113: x0 => x0.getBoundingClientRect(),
      _1116: (x0,x1) => x0.closest(x1),
      _1120: (x0,x1) => x0.querySelectorAll(x1),
      _1121: x0 => x0.remove(),
      _1123: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1125: (x0,x1) => x0.removeAttribute(x1),
      _1126: (x0,x1) => x0.tabIndex = x1,
      _1128: (x0,x1) => x0.focus(x1),
      _1129: x0 => x0.scrollTop,
      _1130: (x0,x1) => x0.scrollTop = x1,
      _1131: x0 => x0.scrollLeft,
      _1132: (x0,x1) => x0.scrollLeft = x1,
      _1133: x0 => x0.classList,
      _1134: (x0,x1) => x0.className = x1,
      _1141: (x0,x1) => x0.getElementsByClassName(x1),
      _1142: x0 => x0.click(),
      _1144: (x0,x1) => x0.hasAttribute(x1),
      _1147: (x0,x1) => x0.attachShadow(x1),
      _1152: (x0,x1) => x0.getPropertyValue(x1),
      _1154: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _1156: (x0,x1) => x0.removeProperty(x1),
      _1158: x0 => x0.offsetLeft,
      _1159: x0 => x0.offsetTop,
      _1160: x0 => x0.offsetParent,
      _1162: (x0,x1) => x0.name = x1,
      _1163: x0 => x0.content,
      _1164: (x0,x1) => x0.content = x1,
      _1182: (x0,x1) => x0.nonce = x1,
      _1187: x0 => x0.now(),
      _1189: (x0,x1) => x0.width = x1,
      _1191: (x0,x1) => x0.height = x1,
      _1196: (x0,x1) => x0.getContext(x1),
      _1273: (x0,x1) => x0.fetch(x1),
      _1274: x0 => x0.status,
      _1276: x0 => x0.body,
      _1277: x0 => x0.arrayBuffer(),
      _1283: x0 => x0.read(),
      _1284: x0 => x0.value,
      _1285: x0 => x0.done,
      _1287: x0 => x0.name,
      _1288: x0 => x0.x,
      _1289: x0 => x0.y,
      _1292: x0 => x0.top,
      _1293: x0 => x0.right,
      _1294: x0 => x0.bottom,
      _1295: x0 => x0.left,
      _1304: x0 => x0.height,
      _1305: x0 => x0.width,
      _1306: (x0,x1) => x0.value = x1,
      _1308: (x0,x1) => x0.placeholder = x1,
      _1309: (x0,x1) => x0.name = x1,
      _1310: x0 => x0.selectionDirection,
      _1311: x0 => x0.selectionStart,
      _1312: x0 => x0.selectionEnd,
      _1315: x0 => x0.value,
      _1317: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1320: x0 => x0.readText(),
      _1321: (x0,x1) => x0.writeText(x1),
      _1322: x0 => x0.altKey,
      _1323: x0 => x0.code,
      _1324: x0 => x0.ctrlKey,
      _1325: x0 => x0.key,
      _1326: x0 => x0.keyCode,
      _1327: x0 => x0.location,
      _1328: x0 => x0.metaKey,
      _1329: x0 => x0.repeat,
      _1330: x0 => x0.shiftKey,
      _1331: x0 => x0.isComposing,
      _1332: (x0,x1) => x0.getModifierState(x1),
      _1334: x0 => x0.state,
      _1335: (x0,x1) => x0.go(x1),
      _1337: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1338: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1339: x0 => x0.pathname,
      _1340: x0 => x0.search,
      _1341: x0 => x0.hash,
      _1345: x0 => x0.state,
      _1352: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1352(f,arguments.length,x0,x1) }),
      _1354: (x0,x1,x2) => x0.observe(x1,x2),
      _1357: x0 => x0.attributeName,
      _1358: x0 => x0.type,
      _1359: x0 => x0.matches,
      _1363: x0 => x0.matches,
      _1365: x0 => x0.relatedTarget,
      _1366: x0 => x0.clientX,
      _1367: x0 => x0.clientY,
      _1368: x0 => x0.offsetX,
      _1369: x0 => x0.offsetY,
      _1372: x0 => x0.button,
      _1373: x0 => x0.buttons,
      _1374: x0 => x0.ctrlKey,
      _1376: (x0,x1) => x0.getModifierState(x1),
      _1379: x0 => x0.pointerId,
      _1380: x0 => x0.pointerType,
      _1381: x0 => x0.pressure,
      _1382: x0 => x0.tiltX,
      _1383: x0 => x0.tiltY,
      _1384: x0 => x0.getCoalescedEvents(),
      _1386: x0 => x0.deltaX,
      _1387: x0 => x0.deltaY,
      _1388: x0 => x0.wheelDeltaX,
      _1389: x0 => x0.wheelDeltaY,
      _1390: x0 => x0.deltaMode,
      _1396: x0 => x0.changedTouches,
      _1398: x0 => x0.clientX,
      _1399: x0 => x0.clientY,
      _1401: x0 => x0.data,
      _1404: (x0,x1) => x0.disabled = x1,
      _1405: (x0,x1) => x0.type = x1,
      _1406: (x0,x1) => x0.max = x1,
      _1407: (x0,x1) => x0.min = x1,
      _1408: (x0,x1) => x0.value = x1,
      _1409: x0 => x0.value,
      _1410: x0 => x0.disabled,
      _1411: (x0,x1) => x0.disabled = x1,
      _1412: (x0,x1) => x0.placeholder = x1,
      _1413: (x0,x1) => x0.name = x1,
      _1414: (x0,x1) => x0.autocomplete = x1,
      _1415: x0 => x0.selectionDirection,
      _1416: x0 => x0.selectionStart,
      _1417: x0 => x0.selectionEnd,
      _1421: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1426: (x0,x1) => x0.add(x1),
      _1430: (x0,x1) => x0.noValidate = x1,
      _1431: (x0,x1) => x0.method = x1,
      _1432: (x0,x1) => x0.action = x1,
      _1459: x0 => x0.orientation,
      _1460: x0 => x0.width,
      _1461: x0 => x0.height,
      _1462: (x0,x1) => x0.lock(x1),
      _1479: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1479(f,arguments.length,x0,x1) }),
      _1488: x0 => x0.length,
      _1489: (x0,x1) => x0.item(x1),
      _1490: x0 => x0.length,
      _1491: (x0,x1) => x0.item(x1),
      _1492: x0 => x0.iterator,
      _1493: x0 => x0.Segmenter,
      _1494: x0 => x0.v8BreakIterator,
      _1498: x0 => x0.done,
      _1499: x0 => x0.value,
      _1500: x0 => x0.index,
      _1504: (x0,x1) => x0.adoptText(x1),
      _1505: x0 => x0.first(),
      _1506: x0 => x0.next(),
      _1508: x0 => x0.current(),
      _1520: x0 => x0.hostElement,
      _1521: x0 => x0.viewConstraints,
      _1523: x0 => x0.maxHeight,
      _1524: x0 => x0.maxWidth,
      _1525: x0 => x0.minHeight,
      _1526: x0 => x0.minWidth,
      _1527: x0 => x0.loader,
      _1528: () => globalThis._flutter,
      _1529: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1530: (x0,x1,x2) => x0.call(x1,x2),
      _1531: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1531(f,arguments.length,x0,x1) }),
      _1532: x0 => new Promise(x0),
      _1536: x0 => x0.length,
      _1538: x0 => x0.tracks,
      _1542: x0 => x0.image,
      _1549: x0 => x0.displayWidth,
      _1550: x0 => x0.displayHeight,
      _1551: x0 => x0.duration,
      _1554: x0 => x0.ready,
      _1555: x0 => x0.selectedTrack,
      _1556: x0 => x0.repetitionCount,
      _1557: x0 => x0.frameCount,
      _1606: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1610: (x0,x1) => x0.createElement(x1),
      _1624: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1625: x0 => x0.createRange(),
      _1626: (x0,x1) => x0.selectNode(x1),
      _1627: x0 => x0.getSelection(),
      _1628: x0 => x0.removeAllRanges(),
      _1629: (x0,x1) => x0.addRange(x1),
      _1630: (x0,x1) => x0.add(x1),
      _1631: (x0,x1) => x0.append(x1),
      _1632: (x0,x1,x2) => x0.insertRule(x1,x2),
      _1633: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1633(f,arguments.length,x0) }),
      _1644: x0 => new Array(x0),
      _1646: x0 => x0.length,
      _1648: (x0,x1) => x0[x1],
      _1649: (x0,x1,x2) => x0[x1] = x2,
      _1652: (x0,x1,x2) => new DataView(x0,x1,x2),
      _1654: x0 => new Int8Array(x0),
      _1655: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _1656: x0 => new Uint8Array(x0),
      _1664: x0 => new Int32Array(x0),
      _1668: x0 => new Float32Array(x0),
      _1670: x0 => new Float64Array(x0),
      _1702: (decoder, codeUnits) => decoder.decode(codeUnits),
      _1703: () => new TextDecoder("utf-8", {fatal: true}),
      _1704: () => new TextDecoder("utf-8", {fatal: false}),
      _1705: x0 => new WeakRef(x0),
      _1706: x0 => x0.deref(),
      _1712: Date.now,
      _1714: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1715: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1716: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1717: () => typeof dartUseDateNowForTicks !== "undefined",
      _1718: () => 1000 * performance.now(),
      _1719: () => Date.now(),
      _1722: () => new WeakMap(),
      _1723: (map, o) => map.get(o),
      _1724: (map, o, v) => map.set(o, v),
      _1725: () => globalThis.WeakRef,
      _1737: s => JSON.stringify(s),
      _1738: s => printToConsole(s),
      _1739: a => a.join(''),
      _1742: (s, t) => s.split(t),
      _1743: s => s.toLowerCase(),
      _1744: s => s.toUpperCase(),
      _1745: s => s.trim(),
      _1746: s => s.trimLeft(),
      _1747: s => s.trimRight(),
      _1749: (s, p, i) => s.indexOf(p, i),
      _1750: (s, p, i) => s.lastIndexOf(p, i),
      _1752: Object.is,
      _1753: s => s.toUpperCase(),
      _1754: s => s.toLowerCase(),
      _1755: (a, i) => a.push(i),
      _1759: a => a.pop(),
      _1760: (a, i) => a.splice(i, 1),
      _1762: (a, s) => a.join(s),
      _1763: (a, s, e) => a.slice(s, e),
      _1766: a => a.length,
      _1768: (a, i) => a[i],
      _1769: (a, i, v) => a[i] = v,
      _1771: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1772: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1773: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1774: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1775: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1776: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1777: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1778: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1780: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1781: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1782: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1783: (t, s) => t.set(s),
      _1785: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1787: o => o.buffer,
      _1788: o => o.byteOffset,
      _1789: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1790: (b, o) => new DataView(b, o),
      _1791: (b, o, l) => new DataView(b, o, l),
      _1792: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1793: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1794: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1795: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1796: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1797: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1798: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1799: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1800: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1801: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1802: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1803: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1806: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1807: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1808: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1809: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1810: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1811: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1824: (o, t) => o instanceof t,
      _1826: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1826(f,arguments.length,x0) }),
      _1827: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1827(f,arguments.length,x0) }),
      _1828: o => Object.keys(o),
      _1829: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1830: (handle) => clearTimeout(handle),
      _1831: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1832: (handle) => clearInterval(handle),
      _1833: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1834: () => Date.now(),
      _1865: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1866: (x0,x1) => x0.exec(x1),
      _1867: (x0,x1) => x0.test(x1),
      _1868: (x0,x1) => x0.exec(x1),
      _1869: (x0,x1) => x0.exec(x1),
      _1870: x0 => x0.pop(),
      _1872: o => o === undefined,
      _1891: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1893: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1894: o => o instanceof RegExp,
      _1895: (l, r) => l === r,
      _1896: o => o,
      _1897: o => o,
      _1898: o => o,
      _1899: b => !!b,
      _1900: o => o.length,
      _1903: (o, i) => o[i],
      _1904: f => f.dartFunction,
      _1905: l => arrayFromDartList(Int8Array, l),
      _1906: l => arrayFromDartList(Uint8Array, l),
      _1907: l => arrayFromDartList(Uint8ClampedArray, l),
      _1908: l => arrayFromDartList(Int16Array, l),
      _1909: l => arrayFromDartList(Uint16Array, l),
      _1910: l => arrayFromDartList(Int32Array, l),
      _1911: l => arrayFromDartList(Uint32Array, l),
      _1912: l => arrayFromDartList(Float32Array, l),
      _1913: l => arrayFromDartList(Float64Array, l),
      _1914: x0 => new ArrayBuffer(x0),
      _1915: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _1916: l => arrayFromDartList(Array, l),
      _1917: () => ({}),
      _1918: () => [],
      _1919: l => new Array(l),
      _1920: () => globalThis,
      _1921: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1922: (o, p) => p in o,
      _1923: (o, p) => o[p],
      _1924: (o, p, v) => o[p] = v,
      _1925: (o, m, a) => o[m].apply(o, a),
      _1927: o => String(o),
      _1928: (p, s, f) => p.then(s, f),
      _1929: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _1930: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1931: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1934: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1935: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1936: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1937: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1938: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1939: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1940: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1943: x0 => x0.index,
      _1944: x0 => x0.groups,
      _1948: x0 => x0.flags,
      _1949: x0 => x0.multiline,
      _1950: x0 => x0.ignoreCase,
      _1951: x0 => x0.unicode,
      _1952: x0 => x0.dotAll,
      _1953: (x0,x1) => x0.lastIndex = x1,
      _1955: (o, p) => o[p],
      _1958: x0 => x0.random(),
      _1959: x0 => x0.random(),
      _1963: () => globalThis.Math,
      _1965: Function.prototype.call.bind(Number.prototype.toString),
      _1966: (d, digits) => d.toFixed(digits),
      _1970: () => globalThis.document,
      _1971: () => globalThis.window,
      _1976: (x0,x1) => x0.height = x1,
      _1978: (x0,x1) => x0.width = x1,
      _1982: x0 => x0.head,
      _1985: x0 => x0.classList,
      _1990: (x0,x1) => x0.innerText = x1,
      _1991: x0 => x0.style,
      _1993: x0 => x0.sheet,
      _2005: x0 => x0.offsetX,
      _2006: x0 => x0.offsetY,
      _2007: x0 => x0.button,
      _3896: () => globalThis.window,
      _3961: x0 => x0.navigator,
      _4352: x0 => x0.userAgent,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
    };

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        const source = await Promise.resolve(loadDeferredWasm(moduleName));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

