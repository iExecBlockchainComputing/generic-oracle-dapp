pragma solidity ^0.8.3;
pragma experimental ABIEncoderV2;

contract OracleDummy {
    
    mapping (bytes32 => bytes) oracleValue;
    
    function receiveResult(bytes32, bytes memory _calldata) 
    public 
    {
        (bytes32 id, bytes memory store) = abi.decode(_calldata, (bytes32, bytes));
        oracleValue[id] = store;
    }
    
    function getString(bytes32 _oracleId) 
    public view
    returns(string memory stringValue)
    {
        return abi.decode(oracleValue[_oracleId], (string));
    }
    
    function getRaw(bytes32 _oracleId) 
    public view
    returns(bytes memory bytesValue)
    {
        return oracleValue[_oracleId];
    }
    
    function getInt(bytes32 _oracleId) 
    public view
    returns(int256 intValue)
    {
        return abi.decode(oracleValue[_oracleId], (int256));
    }
    
    function getBool(bytes32 _oracleId) 
    public view
    returns(bool boolValue)
    {
        return abi.decode(oracleValue[_oracleId], (bool));
    }
}