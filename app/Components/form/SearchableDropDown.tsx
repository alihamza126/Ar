"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { Form, Select, Spin } from "antd";
import type { SelectProps } from "antd/es/select";
import { DDL_Type, fetch_ddl } from "@utils/common";

interface SearchableDropDownProps
    extends Omit<SelectProps<string>, "options" | "children"> {
    debounceTimeout?: number;
    getQueryParams?: () => string;
    onChange?: (value: string) => void;
    ddl_type: DDL_Type;
}

function SearchableDropDown(props: SearchableDropDownProps) {
    const { ddl_type, getQueryParams, debounceTimeout = 800, ...rest } = props;

    const fetchRef = useRef(0);
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<{ label: string; value: string }[]>(
        [],
    );

    const debounceFetcher = useMemo(() => {
        const loadData = async (value: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            try {
                const queryParams = getQueryParams ? getQueryParams() : "";
                const newOptions = await fetch_ddl(value, ddl_type, queryParams);
                if (fetchId === fetchRef.current) {
                    setOptions(newOptions);
                    setFetching(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setFetching(false);
            }
        };

        return debounce(loadData, debounceTimeout);
    }, [ddl_type, getQueryParams, debounceTimeout]);

    useEffect(() => {
        debounceFetcher("");
    }, [debounceFetcher]);

    return (
        <Select
            filterOption={false}
            onSearch={debounceFetcher}
            loading={fetching}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...rest}
            options={options}
        />
    );
}

export default SearchableDropDown;
