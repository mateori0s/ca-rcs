'use strict';
import { Request, response, Response } from "express";
import { performance } from "perf_hooks";
import { verify } from 'jsonwebtoken';

interface ExecuteLog {
    body: any;
    headers: any;
    trailers: any;
    method: any;
    url: any;
    params: any;
    query: any;
    route: any;
    cookies: any;
    ip: any;
    path: any;
    host: any;
    fresh: any;
    stale: any;
    protocol: any;
    secure: any;
    originalUrl: any;
}
const logExecuteData: ExecuteLog[] = [];
const logData = (req: Request) => {
    logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
}

import axios from 'axios';
interface RequestBody {
    username: string;
    password: string;
    campaign_id: string;
    execution_id: string;
    msisdn: string;
}
interface InputParamenter {
    cellularNumber?: string;
    idTemplate?: string;
}
interface DecodedBody {
    inArguments?: InputParamenter[];
}
interface DurationTimestampsPair {
    start: number | null;
    end: number | null;
}

const execute = async function (req: Request, res: Response) {
    const { body } = req;
    const { env: { JWT_SECRET } } = process;

    if (!body) {
        console.error(new Error('invalid jwtdata'));
        return res.status(401).end();
    }
    if (!JWT_SECRET) {
        console.error(new Error('jwtSecret not provided'));
        return res.status(401).end();
    }

    verify(
        body.toString('utf8'),
        JWT_SECRET,
        { algorithms: ['HS256'], complete: false },
        async (err, decoded?: DecodedBody) => {
            if (err) {
                console.error(err);
                return res.status(401).end();
            }

            let RCSREQUEST = true;

            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                const requestBody : Partial<RequestBody> = {username : 'api-claro-argentina', password : 'wFB4255u'}
                let cellularNumber: string | null = null;
                let idTemplate: string | null = null;
                for (const argument of decoded.inArguments) {
                    if (argument.cellularNumber) cellularNumber = argument.cellularNumber;
                    else if (argument.idTemplate) idTemplate = argument.idTemplate;
                }

                if (
                    !cellularNumber ||
                    !idTemplate 
                ) return res.status(400).send(`Input parameter is missing.`);

                if (RCSREQUEST = true) {
                    const { env: { RCS_SMS_API_URL, RCS_API_KEY } } = process;
                    const loginRequestDurationTimestamps: DurationTimestampsPair = { start: performance.now(), end: null };

                    let URL = RCS_SMS_API_URL

                    const loginResponse = await axios.post(
                        `${URL}/auth/login`,
                        requestBody,
                        {
                            headers: {
                                apikey : RCS_API_KEY
                            }
                        }
                    )
                    .catch((error) => {
                        loginRequestDurationTimestamps.end = performance.now();
                        if (error.response) {
                            console.log('BROKER_REQUEST_FAILED')
                        }
                    });
                    
                    console.log('loginResponse:',loginResponse);
                    //console.log('loginResponse:',response.data.access_token);


                    loginRequestDurationTimestamps.end = performance.now();
                    let loginFailed = !loginResponse ? true : false;
                    
                    if (!loginFailed && loginResponse) {
                        const { data, status } = loginResponse;

                        if (status === 200 && data.responseCode !== 0) {
                            console.log('BROKER_REQUEST_FAILED')
                            loginFailed = true;
                        }
                         else {
                            console.log('BROKER_REQUEST_SUCCESS')
                        }
                    }
                    
                    let brokerStatus = false;
                    if (!loginFailed) {
                        brokerStatus = !!(loginResponse && loginResponse.data);
                    }
                    
                    // const sendRcsRequestDurationTimestamps: DurationTimestampsPair = { start: performance.now(), end: null };
                    // const sendRcsResponse = await axios.post(
                    //     `${URL}/api/od_campaign`,
                    //     requestBody,
                    //     {
                    //         headers: {
                    //             Authorization: `Bearer ${token}`,  // Configuración del token
                    //             apikey : RCS_API_KEY
                    //         }
                    //     }
                    // )
                    // .catch((error) => {
                    //     sendRcsRequestDurationTimestamps.end = performance.now();
                    //     if (error.response) {
                    //         console.log('BROKER_REQUEST_FAILED')
                    //     }
                    // });
                    
                    // console.log('sendRcsResponse:',sendRcsResponse);
                    
                    const output = {
                        brokerStatus: brokerStatus
                    };
                    
                    return res.status(200).send(output);
                    
                } 

            } else {
                console.error('inArguments invalid.');
                return res.status(400).end();
            }
        },
    );
};

const edit = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Edit');
};

const save = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Save');
};

const publish = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Publish');
};

const validate = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Validate');
};

const stop = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Stop');
};

function millisToMinutesAndSeconds(millis: number): string {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return Number(seconds) == 60 ? minutes + 1 + 'm' : minutes + 'm ' + (Number(seconds) < 10 ? '0' : '') + seconds + 's';
}

function specialConsoleLog(
    phoneNumber: string,
    eventName: string,
    durationTimestamps: DurationTimestampsPair,
    data: any,
): void {
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    const { start, end } = durationTimestamps;
    let duration = '-';
    if (start && end) duration = millisToMinutesAndSeconds(end - start);

    const jsonifiedData = JSON.stringify(data);

    console.log(`${todayDate}|${currentTime}|${phoneNumber}|${eventName}|${duration}|${jsonifiedData}`);
}

export default {
    logExecuteData,
    execute,
    edit,
    save,
    publish,
    validate,
    stop,
};
