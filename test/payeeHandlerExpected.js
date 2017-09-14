module.exports = {
    initial: [
        {
            "alias": "test alias",
            "names": [
                "another name for this payee"
            ]
        }
    ],
    afterAddingNewName: [
        {
            "alias": "test alias",
            "names": [
                "another name for this payee",
                "a new name"
            ]
        }   
    ],
    afterAddingNewPayee: [
        {
            "alias": "test alias",
            "names": [
                "another name for this payee",
                "a new name"
            ]
        },
        {
            "alias": "another alias",
            "names": [
                "another name"
            ]
        }
    ]
}

