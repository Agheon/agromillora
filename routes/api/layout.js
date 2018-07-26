import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'

const Layout = [
{ 
    method: 'GET',
    path: '/api/layout/getAll', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: "budgetsLayouts" 
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        let layouts = result.docs[0].layouts.reduce((arr, el, i)=>{
                            return arr.concat(el)
                        }, []) 

                        resolve({ok: layouts })
                    } else {
                        resolve({ err: 'No existen plantillas de presupuesto' })
                    }
                })
            })
        }
    }
}
];

export default Layout;
