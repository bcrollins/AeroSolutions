import React, { createContext, useContext, useState, useEffect } from "react";
import { CommandAction } from "@/components/UI/CommandPalette";

interface CommandPaletteContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addActions: (actions: CommandAction[]) => void;
  removeActions: (ids: string[]) => void;
  actions: CommandAction[];
}

const CommandPaletteContext = createContext<CommandPaletteContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  addActions: () => {},
  removeActions: () => {},
  actions: [],
});

interface CommandPaletteProviderProps {
  children: React.ReactNode;
  defaultActions?: CommandAction[];
}

export const CommandPaletteProvider: React.FC<CommandPaletteProviderProps> = ({
  children,
  defaultActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<CommandAction[]>(defaultActions);

  // Add actions to the command palette
  const addActions = (newActions: CommandAction[]) => {
    setActions((prevActions) => {
      // Filter out any actions with IDs that already exist
      const filteredNewActions = newActions.filter(
        (newAction) => !prevActions.some((prevAction) => prevAction.id === newAction.id)
      );

      return [...prevActions, ...filteredNewActions];
    });
  };

  // Remove actions from the command palette
  const removeActions = (ids: string[]) => {
    setActions((prevActions) =>
      prevActions.filter((action) => !ids.includes(action.id))
    );
  };

  return (
    <CommandPaletteContext.Provider
      value={{ isOpen, setIsOpen, addActions, removeActions, actions }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return context;
};

// Custom hook for registering and unregistering actions based on component lifecycle
export const useRegisterCommandActions = (
  actions: CommandAction[],
  dependencies: any[] = []
) => {
  const { addActions, removeActions } = useCommandPalette();

  useEffect(() => {
    // Add actions when the component mounts
    addActions(actions);

    // Remove actions when the component unmounts
    return () => {
      removeActions(actions.map((action) => action.id));
    };
  }, [addActions, removeActions, ...dependencies]);
};

export default useCommandPalette;