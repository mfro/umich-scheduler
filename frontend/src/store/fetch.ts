const term = 'winter18';

export default function fetch(path: string) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.addEventListener('load', () => {
            let value = req.responseText;
            let type = req.getResponseHeader('content-type');
            if (type && type.includes('application/json'))
                value = JSON.parse(value);
            if (req.status >= 200 && req.status < 300)
                resolve(value);
            else
                reject(value);
        })
        req.open('GET', `http://localhost:8081/terms/${term}` + path);
        req.send();
    });
}
