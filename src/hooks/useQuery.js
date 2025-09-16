import { useQuery as useReactQuery } from 'react-query';

const useQuery = (key, fetchFunction, options) => {
    return useReactQuery(key, fetchFunction, options);
};

export default useQuery;