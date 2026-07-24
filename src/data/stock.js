// 库存数据（单独维护，便于手动调整）
// 字段：id（对应商品）、name（商品名，便于对照）、cupStock/gaiwanStock/saucerStock/cup8Stock（杯子库存/盖碗库存/壶承库存/八方杯库存）
export const stockList = [
  { id: 1, name: '青花缠枝莲', cupStock: 3, gaiwanStock: 3, saucerStock: 3, cup8Stock: 0 },
  { id: 2, name: '冰梅', cupStock: 1, gaiwanStock: 1, saucerStock: 1, cup8Stock: 0 },
  { id: 3, name: '缠枝莲釉里红', cupStock: 3, gaiwanStock: 3, saucerStock: 3, cup8Stock: 0 },
  { id: 4, name: '缠枝莲釉里红（双狮）', cupStock: 3, gaiwanStock: 3, saucerStock: 3, cup8Stock: 0 },
  { id: 5, name: '青花松竹梅', cupStock: 0, gaiwanStock: 0, saucerStock: 0, cup8Stock: 1 },
  { id: 6, name: '釉里红松竹梅', cupStock: 0, gaiwanStock: 0, saucerStock: 0, cup8Stock: 1 },
  { id: 7, name: '江崖海水', cupStock: 2, gaiwanStock: 2, saucerStock: 2, cup8Stock: 0 },
  { id: 8, name: '云龙', cupStock: 2, gaiwanStock: 2, saucerStock: 2, cup8Stock: 0 },
  { id: 9, name: '矾红鳜鱼', cupStock: 2, gaiwanStock: 2, saucerStock: 2, cup8Stock: 0 },
  { id: 10, name: '墨龙1.0', cupStock: 5, gaiwanStock: 5, saucerStock: 5, cup8Stock: 0 },
  { id: 11, name: '墨龙2.0', cupStock: 5, gaiwanStock: 5, saucerStock: 0, cup8Stock: 0 },
  { id: 12, name: '慵懒熊猫(矾红枫叶)', cupStock: 0, gaiwanStock: 0, saucerStock: 0, cup8Stock: 0 },
  { id: 13, name: '十二报喜图', cupStock: 0, gaiwanStock: 0, saucerStock: 0, cup8Stock: 0 },
  { id: 14, name: '仿清鱼藻', cupStock: 0, gaiwanStock: 0, saucerStock: 0, cup8Stock: 0 },
]

// 以 id 为键的库存映射，便于组件按 id 查询
export const stockMap = stockList.reduce((map, item) => {
  map[item.id] = item
  return map
}, {})
