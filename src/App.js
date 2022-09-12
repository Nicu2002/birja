import { webSocket } from 'rxjs/webSocket';
import {useEffect, useState} from "react";
import {auditTime, distinct, filter, map, scan,} from "rxjs/operators";
import CanvasJSReact from './canvasjs.react';
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

function App() {
    const [prices, setPrices] = useState([{x: 123456789, y: 19000}]);

    const options = {
        theme: "light2", // "light1", "dark1", "dark2"
        animationEnabled: true,
        zoomEnabled: true,
        title: {
            text: "BTC/BUSD"
        },
        data: [{
            type: "area",
            dataPoints: prices.length > 1 ? prices.slice(1,).map(item => item[Object.getOwnPropertyNames(item)[0]]): null
        }]
    }

    useEffect(() => {
        const subject = webSocket("wss://stream.binance.com:9443/ws")
        subject.next({
            method: "SUBSCRIBE",
            params: ["btcbusd@ticker"],
            id: 1
        })
        subject.asObservable()
            .pipe(
                auditTime(1000),
                map(item => ({[item.E]: {x: item.E, y: +item.c}})),
                scan((init, current) => [...init, current], [])
            )
            .subscribe({
            next: msg => setPrices(msg),
            error: err => console.log("error"),
            complete: () => console.log('complete'),
        });
    }, [])

    const renderPrices = () => prices.map(item => <div style={{backgroundColor: "red", height: "30px", width: `${(item - 19830)* 50}px`}} key={Math.random()}>{item}</div>)

    return (
        <>
            <CanvasJSChart options={options}/>

            <button>Buy {prices[prices.length - 1][Object.getOwnPropertyNames(prices[prices.length - 1])[0]].y}</button>
        </>
    );
}

export default App;
