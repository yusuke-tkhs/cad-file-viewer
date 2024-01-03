import React, { useState, FC, Children, ReactNode } from 'react';
import {
  Flex,
  Text,
  Button,
  Grid,
  Box,
  Container,
  Section,
  Card,
  TextArea,
  Switch,
  RadioGroup,
  Separator,
  Checkbox,
  Popover,
  Responsive,
} from '@radix-ui/themes';

const RadixMenuRadioGroup: FC<{
  values: string[];
  defaultValue: string;
  onValueChange: (label: string) => void;
}> = ({ values, defaultValue, onValueChange }) => {
  return (
    <RadioGroup.Root defaultValue={defaultValue} onValueChange={onValueChange}>
      <Flex gap='2' direction='column'>
        {values.map((value, index) => (
          <Text key={index} as='label' size='2'>
            <Flex gap='2'>
              <RadioGroup.Item value={value} /> {value}
            </Flex>
          </Text>
        ))}
      </Flex>
    </RadioGroup.Root>
  );
};

const RadixMenuButton: FC<{
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ label, onClick }) => {
  return (
    <Button size='1' variant='ghost' onClick={onClick}>
      {label}
    </Button>
  );
};

const RadixMenuCheckBox: FC<{
  label: string;
  onChange: React.FormEventHandler<HTMLButtonElement>;
}> = ({ label, onChange }) => {
  return (
    <Flex gap='2'>
      <Checkbox size='1' variant='soft' onChange={onChange} /> {label}
    </Flex>
  );
};

const RadixMenuSeparator: FC = () => {
  return <Separator my='2' size='2' />;
};

const RadixDropDownMenu: FC<{
  label: string;
  children: ReactNode;
}> = ({ label, children }) => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button size='1' variant='ghost'>
          {label}
        </Button>
      </Popover.Trigger>
      <Popover.Content style={{ width: 360 }}>
        <Flex gap='2' direction='column'>
          {children}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};

const RadixMenu: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <Flex width='100%' direction='column' align='start'>
      {children}
    </Flex>
  );
};

export {
  RadixDropDownMenu,
  RadixMenuButton,
  RadixMenuCheckBox,
  RadixMenuRadioGroup,
  RadixMenuSeparator,
};
