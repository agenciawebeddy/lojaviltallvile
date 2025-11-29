import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PageHeaderData } from '../../types';

const usePageHeader = (pageSlug: string) => {
    const [headerData, setHeaderData] = useState<PageHeaderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeader = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('page_headers')
                .select('*')
                .eq('page_slug', pageSlug)
                .single();

            if (error) {
                console.error(`Error fetching header for ${pageSlug}:`, error);
                setHeaderData(null);
            } else {
                setHeaderData(data as PageHeaderData);
            }
            setIsLoading(false);
        };

        if (pageSlug) {
            fetchHeader();
        }
    }, [pageSlug]);

    return { headerData, isLoading };
};

export default usePageHeader;