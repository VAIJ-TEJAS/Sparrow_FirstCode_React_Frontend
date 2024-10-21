import { createContext, useReducer, ReactNode } from 'react';
import { SET_MAIN } from '../action/MainAction';
import { myMainReducer, State } from '../reducer/MainReducer';

interface MainContextProviderProps {
  children: ReactNode;
}

interface MainContextType {
  state: State;
  setMain: (data: string) => void;
}

export const MainContext = createContext<MainContextType | undefined>(undefined);

const MainContextProvider = ({ children }: MainContextProviderProps) => {
  const [state, dispatch] = useReducer(myMainReducer, { value: { data: '#Please click the readme.txt file to see the steps to follow \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n' } });

  const setMain = (data: string) => {
    dispatch({ type: SET_MAIN, payload: { data } });
  };

  return (
    <MainContext.Provider value={{ state, setMain }}>
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
