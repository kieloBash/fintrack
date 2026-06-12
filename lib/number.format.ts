export const toPriceFormat = (price: number) => {
    return `${price.toLocaleString()}.${price.toFixed(2).split(".")[1]}`
}