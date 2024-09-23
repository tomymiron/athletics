import { createContext, useContext, useEffect, useState } from "react";
import defaultConfig from "../assets/defaultSettings";
import * as SQLite from "expo-sqlite";

const StartConfigContext = createContext();

export const useStartConfig = () => {
    return useContext(StartConfigContext);
};

export const StartConfigProvider = ({children}) => {
    const [startConfig, setStartConfig] = useState(defaultConfig);
    const db = SQLite.useSQLiteContext();

    useEffect(() => {
        const loadStartConfig = async () => {
            try {
                const result = await db.getFirstAsync("SELECT value FROM practice_config WHERE key = 'practiceConfig';");
                const data = result ? result.value : null;
    
                if (data == null) {
                    await db.runAsync("INSERT INTO practice_config (key, value) VALUES ('practiceConfig', ?);", [JSON.stringify(defaultConfig)]);
                    setStartConfig(defaultConfig);
                } else {
                    let parsedConfig;
                    try {
                        parsedConfig = JSON.parse(data);
                        if (!parsedConfig || typeof parsedConfig !== 'object') throw new Error("Invalid config format");

                        setStartConfig(parsedConfig);
                    } catch (parseError) {
                        await db.runAsync("DELETE FROM practice_config WHERE key = 'practiceConfig';");
                        await db.runAsync("INSERT INTO practice_config (key, value) VALUES ('practiceConfig', ?);", [JSON.stringify(defaultConfig)]);
                        setStartConfig(defaultConfig);
                    }
                }
            } catch (e) {setStartConfig(defaultConfig);}
        };
    
        loadStartConfig();
    }, []);

    const updateConfig = async (updatedConfig) => {
        await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(updatedConfig)]);
        setStartConfig(updatedConfig);
    };
    

    const value = { startConfig, updateConfig };
    
    return (
    <StartConfigContext.Provider value={value}>
        {children}
    </StartConfigContext.Provider>);
}