import { supabase } from '../lib/supabase';


export const sessionService = {

    async getSessions() {

        const { data, error } = await supabase
            .from('sessions')
            .select(`
        id,
        name
      `)
            .order('name', {
                ascending: false
            });


        if (error) {

            console.error(
                "Session Fetch Error:",
                error
            );

            throw new Error(
                error.message
            );

        }


        return data || [];

    }

};


export default sessionService;