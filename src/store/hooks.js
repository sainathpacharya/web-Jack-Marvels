import { useDispatch, useSelector, shallowEqual } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector, shallowEqual);
