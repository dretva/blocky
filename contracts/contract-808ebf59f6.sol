pragma solidity ^0.8.18;

import "@openzeppelin/contracts@4.9.2/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.2/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.9.2/token/ERC721/extensions/ERC721URIStorage.sol";

contract Blocky is ERC721, ERC721Burnable, ERC721URIStorage {
    address private _owner;

    constructor() ERC721("Blocky", "BLOCKY") payable {
        _owner = _msgSender();
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function checkURI(string calldata str) internal pure returns(bool) {
        bytes memory identifier = bytes("data:image/svg+xml;base64,");
        bytes calldata input = bytes(str);
        require(input.length >= identifier.length + 1);

        bool isMatch = true;
        for (uint256 i = 0; i <= identifier.length - 1; i++) {
            if (input[i] != identifier[i]) {
                isMatch = false;
                break;
            }
        }
        if (isMatch) {
            return true;
        }

        return false;
    }

    function destruct() external {
        require(_msgSender() == _owner);
        selfdestruct(payable(_msgSender()));
    }

    function mint(uint256 tokenId, string calldata uri) public payable {
        require(tokenId >= 1 && tokenId <= 900 && checkURI(uri) && msg.value >= 1000000 gwei);
        _safeMint(_msgSender(), tokenId);
        _setTokenURI(tokenId, uri);
    }

    function mintMultiple(uint256[] calldata tokenIds, string[] calldata uris) external payable {
        require(tokenIds.length == uris.length && msg.value >= tokenIds.length * 1000000 gwei);
        for (uint256 i = 0; i <= tokenIds.length - 1; i++) {
            mint(tokenIds[i], uris[i]);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function withdraw() external {
        require(_msgSender() == _owner);
        payable(_msgSender()).transfer(address(this).balance);
    }
}
