export function ir(url) {
    window.location.href = url;
}

export async function enviarPeticion(info) {
        let {url, method, params, fSucces } = info, headers = { "Content-Type": "application/json" };
        if (method === "PATCH") headers = { "Content-Type": "multipart/form-data" };
        if (params !== undefined && method === "GET") url += "?" + new URLSearchParams(params);
        if (method === "GET") method ={ method, headers, params};
        if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH" ) method = { method, headers, body: JSON.stringify(params)};
        
        try {
            //console.log(url, method);
            let resp = await fetch(url, method);
            if (!resp.ok) 
                throw { 
            status: resp.status, 
            statusText: resp.statusText };

            //let respJson = await resp.json();
            //console.log(respJson);
            //fSucces(respJson);
        let texto = await resp.text();
        //console.log("Respuesta cruda del servidor:", texto);

        let respJson = JSON.parse(texto);
        fSucces(respJson);
        
        } catch (e) {
            fSucces({
            code: e.status,
            msg: e.statusText
});
        }

}